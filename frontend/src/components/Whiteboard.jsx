import { useEffect, useRef } from "react";
import { IconBoard } from "../icons.jsx";

// Simple canvas whiteboard. Draw locally, broadcast strokes over the shared
// socket, and replay strokes broadcast by everyone else.
export default function Whiteboard({ socket }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);

  function getCtx() {
    return canvasRef.current.getContext("2d");
  }

  function drawLine(ctx, from, to, color = "#1f2937") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 400;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "whiteboard_draw" && data.stroke) {
        drawLine(getCtx(), data.stroke.from, data.stroke.to, data.stroke.color);
      } else if (data.type === "whiteboard_clear") {
        const ctx = getCtx();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handleStart(e) {
    drawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function handleMove(e) {
    if (!drawing.current) return;
    const point = getPoint(e);
    drawLine(getCtx(), lastPoint.current, point);
    socket?.readyState === WebSocket.OPEN &&
      socket.send(
        JSON.stringify({
          type: "whiteboard_draw",
          stroke: { from: lastPoint.current, to: point, color: "#1f2937" },
        })
      );
    lastPoint.current = point;
  }

  function handleEnd() {
    drawing.current = false;
  }

  function clearBoard() {
    getCtx().clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ type: "whiteboard_clear" }));
  }

  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <h3><IconBoard width={18} height={18} />Whiteboard</h3>
        <button className="ghost small" onClick={clearBoard}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
