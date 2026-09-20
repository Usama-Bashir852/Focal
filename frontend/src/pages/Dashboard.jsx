import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { APP_NAME } from "../brand.js";
import { IconRoom, IconPlus, IconKey, IconLogout, IconCopy } from "../icons.jsx";

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const createInputRef = useRef(null);

  useEffect(() => {
    api
      .get("/rooms/mine")
      .then(({ data }) => setRooms(data))
      .catch(() => {});
  }, []);

  async function createRoom(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/rooms", { name: newRoomName });
      navigate(`/room/${data.code}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create room");
    }
  }

  async function joinRoom(e) {
    e.preventDefault();
    setError("");
    const code = joinCode.trim().toUpperCase();
    try {
      await api.get(`/rooms/${code}`);
      navigate(`/room/${code}`);
    } catch (err) {
      setError("Room not found");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  function copyCode(e, code) {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 1500);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <span className="sidebar-brand">{APP_NAME}</span>

        <form className="sidebar-join" onSubmit={joinRoom}>
          <input
            placeholder="Join with code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" className="small" title="Join room">
            <IconKey width={16} height={16} />
          </button>
        </form>

        <p className="sidebar-section-label">YOUR ROOMS</p>
        {rooms.length === 0 ? (
          <p className="sidebar-empty">Nothing yet</p>
        ) : (
          <ul className="sidebar-rooms">
            {rooms.map((room) => (
              <li key={room.id} onClick={() => navigate(`/room/${room.code}`)}>
                <IconRoom width={16} height={16} />
                <span>{room.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="sidebar-foot">
          <span>{name}</span>
          <button onClick={logout} title="Log out">
            <IconLogout width={16} height={16} />
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <h1>Your rooms</h1>
        <p className="muted">
          {rooms.length === 0
            ? "Create your first room to get started."
            : `${rooms.length} room${rooms.length === 1 ? "" : "s"}, ready when you are.`}
        </p>

        {error && <div className="error">{error}</div>}

        <form className="create-room-form" onSubmit={createRoom}>
          <input
            ref={createInputRef}
            placeholder="Name a new room (e.g. Data Structures Group)"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            required
          />
          <button type="submit" className="brass">
            <IconPlus width={16} height={16} />
            Create room
          </button>
        </form>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <div className="icon-wrap">
              <IconRoom width={28} height={28} />
            </div>
            <p>No rooms yet -- your first one is one click away.</p>
            <button className="brass" onClick={() => createInputRef.current?.focus()}>
              Create your first room
            </button>
          </div>
        ) : (
          <ul className="room-list">
            {rooms.map((room) => (
              <li key={room.id} onClick={() => navigate(`/room/${room.code}`)}>
                <div className="room-card-info">
                  <span className="room-avatar">{room.name.charAt(0).toUpperCase()}</span>
                  <span>{room.name}</span>
                </div>
                <button
                  className="ghost small code-copy"
                  onClick={(e) => copyCode(e, room.code)}
                  title="Copy room code"
                >
                  <IconCopy width={14} height={14} />
                  {copiedCode === room.code ? "Copied" : room.code}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
