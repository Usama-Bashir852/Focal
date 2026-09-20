import { useEffect, useRef, useState } from "react";
import api from "../api.js";
import { IconChat } from "../icons.jsx";

export default function Chat({ socket, roomCode }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .get(`/rooms/${roomCode}/messages`)
      .then(({ data }) => setMessages(data))
      .catch(() => {});
  }, [roomCode]);

  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "chat_message", content: text.trim() }));
    setText("");
  }

  return (
    <div className="chat">
      <h3><IconChat width={18} height={18} />Chat</h3>
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.is_bot ? "bot" : ""}`}>
            <span className="sender">{m.sender_name}</span>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
