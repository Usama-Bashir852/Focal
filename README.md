# Focal

A small real-time virtual study room app, built as a portfolio project. Inspired
by a university FYP for a similar study-room app (Flask/Socket.IO/SQLite), rebuilt
independently on a different stack: **FastAPI + native WebSockets, React,
PostgreSQL**, fully Dockerized for one-command deployment to a VPS.

## Features

- Email/password auth (JWT)
- Create/join study rooms via a short room code
- Real-time collaborative whiteboard (canvas + WebSocket broadcast)
- Real-time chat with persisted history (PostgreSQL)
- Server-authoritative synced Pomodoro timer (everyone in a room sees the same countdown)
- Video calls via an embedded Jitsi Meet room (no signaling server needed)
- AI study-help chatbot ("Collab Bot") backed by Groq's free-tier Llama 3.1 API, answers post into the shared chat for everyone

## Architecture

```
React (nginx, port 80)  <---- HTTP ---->  FastAPI (port 8000)  <---->  PostgreSQL
                         <---- WS   ---->  /ws/{room_code}
                                           (auth, rooms, chat, whiteboard
                                            relay, timer, chatbot)
```

One WebSocket connection per client per room carries chat messages,
whiteboard strokes, and Pomodoro timer sync as typed JSON events
(`chat_message`, `whiteboard_draw`, `whiteboard_clear`, `timer_start`,
`timer_pause`, `timer_reset`, `timer_state`, `presence`).

## Run locally with Docker (recommended)

```bash
cp .env.example .env
# edit .env: set a real JWT_SECRET, and GROQ_API_KEY if you want the chatbot to work
docker compose up --build
```

- Frontend: http://localhost
- Backend docs (Swagger): http://localhost:8000/docs

## Run without Docker (local dev)

Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://collabstudy:collabstudy@localhost:5432/collabstudy
export JWT_SECRET=dev-secret
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

You'll need a local Postgres instance running, or just point `DATABASE_URL`
at `sqlite:///./dev.db` for quick local testing (swap `psycopg2-binary` isn't
needed then, but SQLAlchemy handles the URL switch transparently).

## Getting a free Groq API key (for the AI chatbot)

1. Sign up at https://console.groq.com
2. Create an API key
3. Put it in `.env` as `GROQ_API_KEY=...`

Without it, the chatbot still works end-to-end but replies with a
"not configured" message instead of a real answer -- useful for demoing the
plumbing without a key.

