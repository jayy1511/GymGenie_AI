"""
GymGenie AI — Health Check Route
"""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "GymGenie AI API"}
