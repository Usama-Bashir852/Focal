import { useState } from "react";
import api from "../api.js";
import { IconBot } from "../icons.jsx";

export default function Chatbot({ roomCode }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      // The answer is broadcast into the shared chat over the WebSocket by
      // the backend, so it just shows up in <Chat /> for everyone -- we
      // don't need to render it separately here.
      await api.post("/api/chatbot", { room_code: roomCode, question: question.trim() });
      setQuestion("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="chatbot" onSubmit={ask}>
      <h3><IconBot width={18} height={18} />Ask the study bot</h3>
      <input
        placeholder="Ask a study question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      <p className="muted small">Answers appear in the chat panel for everyone in the room.</p>
    </form>
  );
}
