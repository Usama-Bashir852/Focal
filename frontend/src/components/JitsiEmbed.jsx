// Zero backend work: Jitsi Meet's public server can be embedded directly.
// Each room code maps to a unique Jitsi room so calls don't collide across
// different study rooms.
import { IconVideo } from "../icons.jsx";

export default function JitsiEmbed({ roomCode }) {
  const jitsiRoomName = `focal-${roomCode}`;
  const src = `https://meet.jit.si/${jitsiRoomName}#config.prejoinPageEnabled=false`;

  return (
    <div className="video-call">
      <h3><IconVideo width={18} height={18} />Video call</h3>
      <iframe
        title="Jitsi video call"
        src={src}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{ width: "100%", height: "400px", border: "none", borderRadius: "8px" }}
      />
    </div>
  );
}
