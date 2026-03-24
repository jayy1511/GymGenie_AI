"""
GymGenie AI — Chat Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None  # None = new conversation


class ChatMessageData(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class ChatSessionDetailResponse(BaseModel):
    id: str
    title: str
    messages: List[ChatMessageData]
    created_at: datetime
    updated_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    message: str
    exercises_used: Optional[List[dict]] = None
