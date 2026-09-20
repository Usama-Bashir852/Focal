from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import auth, rooms, ws, chatbot

# For a CV/demo project, create-tables-on-startup is fine. If you outgrow this,
# swap in Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Focal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(chatbot.router)
app.include_router(ws.router)


@app.get("/health")
def health():
    return {"status": "ok"}
