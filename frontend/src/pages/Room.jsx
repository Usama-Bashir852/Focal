import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { WS_BASE_URL } from "../api.js";
import Whiteboard from "../components/Whiteboard.jsx";
import Chat from "../components/Chat.jsx";
import PomodoroTimer from "../components/PomodoroTimer.jsx";
import JitsiEmbed from "../components/JitsiEmbed.jsx";
import Chatbot from "../components/Chatbot.jsx";

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    api
      .get(`/rooms/${code}`)
      .then(({ data }) => setRoom(data))
      .catch(() => setError("Room not found"));
  }, [code]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/${code}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => setSocket(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "presence") {
        setParticipantCount(data.count);
      }
    };
    ws.onclose = () => setSocket(null);

    return () => ws.close();
  }, [code]);

  if (error) {
    return (
      <div className="room-error">
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")}>Back to dashboard</button>
      </div>
    );
  }

  if (!room) return <div className="loading">Loading room...</div>;

  return (
    <div className="room">
      <header>
        <div>
          <h1>{room.name}</h1>
          <span className="muted">
            Room code: <code>{room.code}</code> &middot; {participantCount} online
          </span>
        </div>
        <button className="ghost" onClick={() => navigate("/dashboard")}>
          Leave
        </button>
      </header>

      <div className="room-grid">
        <div className="room-main">
          <Whiteboard socket={socket} />
          <JitsiEmbed roomCode={room.code} />
        </div>
        <div className="room-side">
          <PomodoroTimer socket={socket} />
          <Chatbot roomCode={room.code} />
          <Chat socket={socket} roomCode={room.code} />
        </div>
      </div>
    </div>
  );
}
