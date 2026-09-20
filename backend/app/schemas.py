from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str


class RoomCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class RoomResponse(BaseModel):
    id: str
    code: str
    name: str
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: str
    sender_name: str
    content: str
    is_bot: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatbotRequest(BaseModel):
    room_code: str
    question: str
