"""
GymGenie AI — Gemini AI Service
Handles prompt construction, profile-aware context, and Gemini API calls.
Uses direct REST API calls for reliable deployment on constrained platforms.
"""
import httpx
import json
from typing import Optional, List
from app.core.config import settings


SYSTEM_PROMPT = """You are GymGenie AI — a sharp, knowledgeable fitness coach who talks like a real personal trainer.

Keep your responses practical, actionable, and to the point. Don't over-explain basics.
Use markdown formatting: **bold** for key terms, bullet points for lists, numbered steps for routines.
Be direct and helpful — skip the fluff.

If asked about medical issues, briefly suggest seeing a doctor. Don't add disclaimers to every response.
If asked something off-topic, redirect to fitness.
"""


def build_user_context(profile: dict) -> str:
    """Build a context string from user profile data."""
    if not profile:
        return ""

    parts = ["\n--- User Profile ---"]
    if profile.get("name"):
        parts.append(f"Name: {profile['name']}")
    if profile.get("age"):
        parts.append(f"Age: {profile['age']}")
    if profile.get("gender"):
        parts.append(f"Gender: {profile['gender']}")
    if profile.get("height_cm"):
        parts.append(f"Height: {profile['height_cm']} cm")
    if profile.get("weight_kg"):
        parts.append(f"Weight: {profile['weight_kg']} kg")
    if profile.get("fitness_goal"):
        parts.append(f"Fitness Goal: {profile['fitness_goal']}")
    if profile.get("experience_level"):
        parts.append(f"Experience Level: {profile['experience_level']}")
    if profile.get("workout_frequency"):
        parts.append(f"Workout Frequency: {profile['workout_frequency']}")
    if profile.get("injuries"):
        parts.append(f"Injuries/Limitations: {profile['injuries']}")
    parts.append("--- End Profile ---\n")

    return "\n".join(parts)


def build_exercise_context(exercises: List[dict]) -> str:
    """Build a context string from retrieved exercise data."""
    if not exercises:
        return ""

    parts = ["\n--- Relevant Exercises from Database ---"]
    for i, ex in enumerate(exercises[:8], 1):
        parts.append(
            f"{i}. **{ex['title']}** | {ex['body_part']} | {ex['equipment']} | {ex['level']}"
        )
        if ex.get("description"):
            parts.append(f"   {ex['description'][:150]}")
    parts.append("--- End Exercises ---\n")
    parts.append(
        "Use the above exercise data to inform your response when relevant. "
        "You can reference specific exercises by name and provide additional guidance."
    )

    return "\n".join(parts)


GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


async def _call_gemini(model: str, system: str, contents: list) -> str:
    """Call Gemini REST API directly with httpx."""
    url = GEMINI_API_URL.format(model=model)

    body = {
        "system_instruction": {
            "parts": [{"text": system}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
        },
    }

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            url,
            params={"key": settings.GEMINI_API_KEY},
            json=body,
            headers={"Content-Type": "application/json"},
        )

    if response.status_code != 200:
        error_detail = response.text[:300]
        raise Exception(f"Gemini API {response.status_code}: {error_detail}")

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise Exception(f"No candidates in Gemini response: {json.dumps(data)[:300]}")

    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts)


async def generate_response(
    user_message: str,
    chat_history: List[dict] = None,
    user_profile: dict = None,
    relevant_exercises: List[dict] = None,
) -> str:
    """Generate a fitness-focused AI response using Gemini."""
    if not settings.GEMINI_API_KEY:
        return (
            "AI service is not configured. Please set the GEMINI_API_KEY "
            "environment variable to enable the AI assistant."
        )

    try:
        # Build full system instruction
        full_system = SYSTEM_PROMPT
        full_system += build_user_context(user_profile)
        full_system += build_exercise_context(relevant_exercises)

        # Build conversation history for Gemini API format
        contents = []

        # Add recent chat history (last 10 messages)
        if chat_history:
            recent = chat_history[-10:]
            for msg in recent:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

        # Add current user message
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        # Try gemini-2.0-flash first (most reliable)
        return await _call_gemini("gemini-2.0-flash", full_system, contents)

    except Exception as e:
        print(f"Gemini API error ({type(e).__name__}): {e}")

        # Retry with a different model
        try:
            print("Retrying with gemini-1.5-flash...")
            return await _call_gemini("gemini-1.5-flash", full_system, contents)
        except Exception as e2:
            print(f"Fallback also failed ({type(e2).__name__}): {e2}")
            return (
                "I'm sorry, I'm having trouble processing your request right now. "
                "Please try again in a moment. If the issue persists, check the API configuration."
            )

