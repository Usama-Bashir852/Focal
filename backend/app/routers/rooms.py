import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Room, User, Message, RoomParticipant
from ..schemas import RoomCreateRequest, RoomResponse, MessageResponse

router = APIRouter(prefix="/rooms", tags=["rooms"])


def generate_room_code(db: Session) -> str:
    while True:
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not db.query(Room).filter(Room.code == code).first():
            return code


@router.post("", response_model=RoomResponse)
def create_room(
    payload: RoomCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = Room(name=payload.name, code=generate_room_code(db), owner_id=current_user.id)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.get("/mine", response_model=list[RoomResponse])
def my_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Rooms the user owns, plus rooms they've joined by code -- previously
    # this only returned owned rooms, so a room never showed up on the
    # dashboard of anyone who joined it rather than created it.
    owned_ids = {r.id for r in db.query(Room.id).filter(Room.owner_id == current_user.id).all()}
    joined_ids = {
        p.room_id
        for p in db.query(RoomParticipant.room_id).filter(RoomParticipant.user_id == current_user.id).all()
    }
    all_ids = owned_ids | joined_ids
    if not all_ids:
        return []
    return db.query(Room).filter(Room.id.in_(all_ids)).order_by(Room.created_at.desc()).all()


@router.get("/{code}", response_model=RoomResponse)
def get_room(code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Opening a room by code counts as joining it -- record that (once) so
    # it shows up on this user's dashboard too, not just the owner's.
    if room.owner_id != current_user.id:
        already = (
            db.query(RoomParticipant)
            .filter(RoomParticipant.room_id == room.id, RoomParticipant.user_id == current_user.id)
            .first()
        )
        if not already:
            db.add(RoomParticipant(room_id=room.id, user_id=current_user.id))
            db.commit()

    return room


@router.get("/{code}/messages", response_model=list[MessageResponse])
def room_messages(code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    room = db.query(Room).filter(Room.code == code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return (
        db.query(Message)
        .filter(Message.room_id == room.id)
        .order_by(Message.created_at.asc())
        .limit(200)
        .all()
    )
