import json
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    """Keeps track of active WebSocket connections per room and broadcasts events.

    In-memory by design -- fine for a single backend instance (the demo/deploy
    target here). If you ever scale to multiple backend replicas, swap this
    for a Redis pub/sub backed version so broadcasts reach every instance.
    """

    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(room_code, []).append(websocket)

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.rooms and websocket in self.rooms[room_code]:
            self.rooms[room_code].remove(websocket)
            if not self.rooms[room_code]:
                del self.rooms[room_code]

    async def broadcast(self, room_code: str, message: dict, exclude: WebSocket | None = None):
        payload = json.dumps(message)
        for connection in self.rooms.get(room_code, []):
            if connection is exclude:
                continue
            try:
                await connection.send_text(payload)
            except Exception:
                # Connection is dead; it'll be cleaned up on its own disconnect event.
                pass

    def room_size(self, room_code: str) -> int:
        return len(self.rooms.get(room_code, []))


manager = ConnectionManager()


import asyncio


class TimerManager:
    """Server-authoritative Pomodoro timer, one background ticker per active room."""

    FOCUS_SECONDS = 25 * 60
    BREAK_SECONDS = 5 * 60

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.tasks: Dict[str, asyncio.Task] = {}

    def is_running(self, room_code: str) -> bool:
        task = self.tasks.get(room_code)
        return task is not None and not task.done()

    async def start(self, room_code: str, room_state: dict):
        if self.is_running(room_code):
            return
        room_state["timer_status"] = "running"
        self.tasks[room_code] = asyncio.create_task(self._tick_loop(room_code, room_state))

    async def pause(self, room_code: str, room_state: dict):
        room_state["timer_status"] = "paused"
        task = self.tasks.pop(room_code, None)
        if task:
            task.cancel()
        await self.connection_manager.broadcast(room_code, {"type": "timer_state", **room_state})

    async def reset(self, room_code: str, room_state: dict):
        task = self.tasks.pop(room_code, None)
        if task:
            task.cancel()
        room_state["timer_status"] = "idle"
        room_state["timer_mode"] = "focus"
        room_state["timer_seconds_left"] = self.FOCUS_SECONDS
        await self.connection_manager.broadcast(room_code, {"type": "timer_state", **room_state})

    async def _tick_loop(self, room_code: str, room_state: dict):
        try:
            while room_state["timer_seconds_left"] > 0:
                await asyncio.sleep(1)
                room_state["timer_seconds_left"] -= 1
                await self.connection_manager.broadcast(room_code, {"type": "timer_state", **room_state})

            # Time's up -- flip between focus and break automatically.
            if room_state["timer_mode"] == "focus":
                room_state["timer_mode"] = "break"
                room_state["timer_seconds_left"] = self.BREAK_SECONDS
            else:
                room_state["timer_mode"] = "focus"
                room_state["timer_seconds_left"] = self.FOCUS_SECONDS
            room_state["timer_status"] = "idle"
            await self.connection_manager.broadcast(room_code, {"type": "timer_state", **room_state})
        except asyncio.CancelledError:
            pass


timer_manager = TimerManager(manager)

# In-memory per-room timer state, keyed by room code. Seeded lazily on first use.
room_states: Dict[str, dict] = {}


def get_room_state(room_code: str) -> dict:
    if room_code not in room_states:
        room_states[room_code] = {
            "timer_status": "idle",
            "timer_seconds_left": TimerManager.FOCUS_SECONDS,
            "timer_mode": "focus",
        }
    return room_states[room_code]
