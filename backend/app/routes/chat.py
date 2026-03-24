"""
GymGenie AI — Chat Routes
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas.chat import (
    ChatMessageRequest,
    ChatResponse,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageData,
)
from app.services.gemini_service import generate_response
from app.services.exercise_service import exercise_service

router = APIRouter(prefix="/chat", tags=["Chat"])


def generate_title(message: str) -> str:
    """Generate a short title from the first message."""
    title = message.strip()[:60]
    if len(message) > 60:
        title += "..."
    return title


@router.post("/message", response_model=ChatResponse)
async def send_message(
    req: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    now = datetime.now(timezone.utc)

    # Get user profile for context
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    user_profile = {
        "name": user.get("name"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "height_cm": user.get("height_cm"),
        "weight_kg": user.get("weight_kg"),
        "fitness_goal": user.get("fitness_goal"),
        "experience_level": user.get("experience_level"),
        "workout_frequency": user.get("workout_frequency"),
        "injuries": user.get("injuries"),
    } if user else {}

    # Get relevant exercises from ML + dataset
    relevant_exercises = exercise_service.get_relevant_exercises(
        query=req.message,
        user_profile=user_profile,
    )

    # Handle session (existing or new)
    session_id = None
    chat_history = []

    if req.session_id:
        try:
            session = await db.chat_sessions.find_one({
                "_id": ObjectId(req.session_id),
                "user_id": user_id,
            })
            if session:
                session_id = req.session_id
                chat_history = session.get("messages", [])
        except Exception:
            pass

    # Create new session if needed
    if session_id is None:
        session_doc = {
            "user_id": user_id,
            "title": generate_title(req.message),
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        result = await db.chat_sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)

    # Generate AI response
    ai_response = await generate_response(
        user_message=req.message,
        chat_history=chat_history,
        user_profile=user_profile,
        relevant_exercises=relevant_exercises,
    )

    # Save messages to session
    user_msg = {"role": "user", "content": req.message, "timestamp": now}
    assistant_msg = {"role": "assistant", "content": ai_response, "timestamp": now}

    await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
            "$set": {"updated_at": now},
        },
    )

    return ChatResponse(
        session_id=session_id,
        message=ai_response,
        exercises_used=relevant_exercises[:5] if relevant_exercises else None,
    )


@router.get("/history", response_model=List[ChatSessionResponse])
async def get_chat_history(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
):
    db = get_db()

    sessions = await db.chat_sessions.find(
        {"user_id": user_id},
        {"messages": 0},  # Exclude full messages for list view
    ).sort("updated_at", -1).limit(limit).to_list(length=limit)

    return [
        ChatSessionResponse(
            id=str(s["_id"]),
            title=s.get("title", "Untitled Chat"),
            created_at=s.get("created_at", datetime.now(timezone.utc)),
            updated_at=s.get("updated_at", datetime.now(timezone.utc)),
            message_count=s.get("message_count", 0),
        )
        for s in sessions
    ]


@router.get("/history/{session_id}", response_model=ChatSessionDetailResponse)
async def get_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()

    try:
        session = await db.chat_sessions.find_one({
            "_id": ObjectId(session_id),
            "user_id": user_id,
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID",
        )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    messages = [
        ChatMessageData(
            role=m["role"],
            content=m["content"],
            timestamp=m.get("timestamp", session.get("created_at")),
        )
        for m in session.get("messages", [])
    ]

    return ChatSessionDetailResponse(
        id=str(session["_id"]),
        title=session.get("title", "Untitled Chat"),
        messages=messages,
        created_at=session.get("created_at", datetime.now(timezone.utc)),
        updated_at=session.get("updated_at", datetime.now(timezone.utc)),
    )


@router.delete("/history/{session_id}")
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()

    try:
        result = await db.chat_sessions.delete_one({
            "_id": ObjectId(session_id),
            "user_id": user_id,
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID",
        )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    return {"message": "Chat session deleted"}
