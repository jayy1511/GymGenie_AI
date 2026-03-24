"""
GymGenie AI — Auth Routes
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from app.db.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    db = get_db()

    # Check if email already exists
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user document
    user_doc = {
        "email": req.email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "age": req.age,
        "gender": req.gender,
        "height_cm": req.height_cm,
        "weight_kg": req.weight_kg,
        "fitness_goal": req.fitness_goal,
        "experience_level": req.experience_level,
        "workout_frequency": req.workout_frequency,
        "injuries": req.injuries,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate token
    token = create_access_token({"sub": user_id, "email": req.email})

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=req.name,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": req.email})

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=user["name"],
    )


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user_id)):
    from bson import ObjectId

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "age": user.get("age"),
        "gender": user.get("gender"),
        "height_cm": user.get("height_cm"),
        "weight_kg": user.get("weight_kg"),
        "fitness_goal": user.get("fitness_goal"),
        "experience_level": user.get("experience_level"),
        "workout_frequency": user.get("workout_frequency"),
        "injuries": user.get("injuries"),
        "created_at": user.get("created_at"),
    }
