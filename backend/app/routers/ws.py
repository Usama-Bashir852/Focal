import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from ..auth import decode_token
from ..database import SessionLocal
from ..models import Room, Message, User
from ..websocket_manager import manager, timer_manager, get_room_state

router = APIRouter()


@router.websocket("/ws/{room_code}")
async def room_socket(websocket: WebSocket, room_code: str, token: str = Query(...)):
    room_code = room_code.upper()

    # Auth: browsers can't set custom headers on a WebSocket handshake, so the
    # JWT is passed as a query param instead (?token=...).
    try:
        user_id = decode_token(token)
    except Exception:
        await websocket.close(code=4401)
        return

    db: Session = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    room = db.query(Room).filter(Room.code == room_code).first()
    if not user or not room:
        db.close()
        await websocket.close(code=4404)
        return

    await manager.connect(room_code, websocket)
    room_state = get_room_state(room_code)

    # Bring the newly-joined client up to speed.
    await websocket.send_text(json.dumps({"type": "timer_state", **room_state}))
    await manager.broadcast(
        room_code,
        {"type": "presence", "event": "joined", "user": user.name, "count": manager.room_size(room_code)},
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            event_type = data.get("type")

            if event_type == "chat_message":
                content = (data.get("content") or "").strip()
                if not content:
                    continue
                msg = Message(room_id=room.id, sender_name=user.name, content=content, is_bot=0)
                db.add(msg)
                db.commit()
                db.refresh(msg)
                await manager.broadcast(
                    room_code,
                    {
                        "type": "chat_message",
                        "id": msg.id,
                        "sender_name": msg.sender_name,
                        "content": msg.content,
                        "is_bot": 0,
                        "created_at": msg.created_at.isoformat(),
                    },
                )

            elif event_type == "whiteboard_draw":
                # Just relay stroke data to everyone else -- backend doesn't
                # need to understand the drawing, only fan it out.
                await manager.broadcast(
                    room_code,
                    {"type": "whiteboard_draw", "stroke": data.get("stroke")},
                    exclude=websocket,
                )

            elif event_type == "whiteboard_clear":
                await manager.broadcast(room_code, {"type": "whiteboard_clear"}, exclude=websocket)

            elif event_type == "timer_start":
                await timer_manager.start(room_code, room_state)

            elif event_type == "timer_pause":
                await timer_manager.pause(room_code, room_state)

            elif event_type == "timer_reset":
                await timer_manager.reset(room_code, room_state)

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(room_code, websocket)
        db.close()
        await manager.broadcast(
            room_code,
            {"type": "presence", "event": "left", "user": user.name, "count": manager.room_size(room_code)},
        )
