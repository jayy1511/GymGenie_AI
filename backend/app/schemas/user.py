"""
GymGenie AI — User/Profile Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    workout_frequency: Optional[str] = None
    injuries: Optional[str] = None


class UserProfileUpdate(UserProfile):
    name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_goal: Optional[str] = None
    experience_level: Optional[str] = None
    workout_frequency: Optional[str] = None
    injuries: Optional[str] = None
    created_at: Optional[datetime] = None
