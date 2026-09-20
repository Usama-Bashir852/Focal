import { useEffect, useState } from "react";
import { IconTimer } from "../icons.jsx";

function format(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroTimer({ socket }) {
  const [state, setState] = useState({ timer_status: "idle", timer_seconds_left: 25 * 60, timer_mode: "focus" });

  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "timer_state") {
        setState(data);
      }
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  function send(type) {
    socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ type }));
  }

  return (
    <div className="pomodoro">
      <h3><IconTimer width={18} height={18} />Pomodoro ({state.timer_mode === "focus" ? "Focus" : "Break"})</h3>
      <div className="pomodoro-time">{format(state.timer_seconds_left)}</div>
      <div className="pomodoro-controls">
        {state.timer_status === "running" ? (
          <button onClick={() => send("timer_pause")}>Pause</button>
        ) : (
          <button onClick={() => send("timer_start")}>Start</button>
        )}
        <button className="ghost" onClick={() => send("timer_reset")}>
          Reset
        </button>
      </div>
      <p className="muted small">Synced for everyone in this room.</p>
    </div>
  );
}
