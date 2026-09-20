import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    rooms_owned = relationship("Room", back_populates="owner")


class RoomParticipant(Base):
    __tablename__ = "room_participants"

    id = Column(String, primary_key=True, default=gen_uuid)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="participants")
    user = relationship("User")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, default=gen_uuid)
    code = Column(String(8), unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Pomodoro state, kept simple and server-authoritative
    timer_status = Column(String, default="idle")  # idle | running | paused
    timer_seconds_left = Column(Integer, default=25 * 60)
    timer_mode = Column(String, default="focus")  # focus | break

    owner = relationship("User", back_populates="rooms_owned")
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")
    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    sender_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_bot = Column(Integer, default=0)  # 0/1 flag, avoids Boolean/SQLite quirks if swapped later
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="messages")
