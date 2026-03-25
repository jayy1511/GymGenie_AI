"""
GymGenie AI — Application Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "gymgenie"

    # JWT
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # ML artifacts path
    ML_ARTIFACTS_PATH: Optional[str] = None
    DATASET_PATH: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
