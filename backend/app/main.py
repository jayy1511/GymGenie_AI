"""
GymGenie AI — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection
from app.services.exercise_service import exercise_service
from app.routes import auth, users, chat, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    exercise_service.load(
        artifacts_path=settings.ML_ARTIFACTS_PATH,
        dataset_path=settings.DATASET_PATH,
    )
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="GymGenie AI",
    description="AI-powered fitness assistant API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if settings.FRONTEND_URL:
    # Support comma-separated origins
    for url in settings.FRONTEND_URL.split(","):
        url = url.strip().rstrip("/")
        if url:
            origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "GymGenie AI",
        "version": "1.0.0",
        "docs": "/docs",
    }
