import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models import Room, Message, User
from ..schemas import ChatbotRequest, MessageResponse
from ..websocket_manager import manager

router = APIRouter(prefix="/api", tags=["chatbot"])

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


@router.post("/chatbot", response_model=MessageResponse)
async def ask_chatbot(
    payload: ChatbotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.code == payload.room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if not settings.groq_api_key:
        answer = (
            "AI chatbot isn't configured yet -- set GROQ_API_KEY in the backend "
            "environment to enable real answers."
        )
    else:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(
                    GROQ_URL,
                    headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                    json={
                        "model": settings.groq_model,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are Study Bot, a concise study-help assistant inside a "
                                "student study-room app. Help with academic questions, explanations, "
                                "and problem solving.",
                            },
                            {"role": "user", "content": payload.question},
                        ],
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                answer = data["choices"][0]["message"]["content"]
        except Exception:
            answer = "Sorry, I couldn't reach the AI service just now -- try again in a moment."

    msg = Message(room_id=room.id, sender_name="Study Bot", content=answer, is_bot=1)
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Broadcast so everyone else in the room sees the bot's answer live too.
    await manager.broadcast(
        room.code,
        {
            "type": "chat_message",
            "id": msg.id,
            "sender_name": msg.sender_name,
            "content": msg.content,
            "is_bot": 1,
            "created_at": msg.created_at.isoformat(),
        },
    )

    return msg
