"""
GymGenie AI — User/Profile Routes
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.db.database import get_db
from app.core.security import get_current_user_id
from app.schemas.user import UserProfileUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        age=user.get("age"),
        gender=user.get("gender"),
        height_cm=user.get("height_cm"),
        weight_kg=user.get("weight_kg"),
        fitness_goal=user.get("fitness_goal"),
        experience_level=user.get("experience_level"),
        workout_frequency=user.get("workout_frequency"),
        injuries=user.get("injuries"),
        created_at=user.get("created_at"),
    )


@router.put("/me/profile", response_model=UserResponse)
async def update_profile(
    profile: UserProfileUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()

    # Build update dict, only include non-None fields
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Return updated user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        age=user.get("age"),
        gender=user.get("gender"),
        height_cm=user.get("height_cm"),
        weight_kg=user.get("weight_kg"),
        fitness_goal=user.get("fitness_goal"),
        experience_level=user.get("experience_level"),
        workout_frequency=user.get("workout_frequency"),
        injuries=user.get("injuries"),
        created_at=user.get("created_at"),
    )
