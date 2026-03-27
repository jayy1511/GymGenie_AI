"""
GymGenie AI — Gemini AI Service
Handles prompt construction, profile-aware context, and Gemini API calls.
Uses the modern google-genai SDK.
"""
from google import genai
from google.genai import types
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
        title = ex.get('title', 'Unknown Exercise')
        body_part = ex.get('body_part', 'Unknown')
        equipment = ex.get('equipment', 'Unknown')
        level = ex.get('level', 'Unknown')
        parts.append(f"{i}. **{title}** | {body_part} | {equipment} | {level}")
        
        description = ex.get('description', '')
        if description:
            parts.append(f"   {description[:150]}")
    parts.append("--- End Exercises ---\n")
    parts.append(
        "Use the above exercise data to inform your response when relevant. "
        "You can reference specific exercises by name and provide additional guidance."
    )

    return "\n".join(parts)


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
        import logging
        logging.info("=== GEMINI DEPLOYMENT DEBUG ===")
        logging.info(f"API Key present: {bool(settings.GEMINI_API_KEY)}")
        if settings.GEMINI_API_KEY:
            logging.info(f"API Key Length: {len(settings.GEMINI_API_KEY)}")
        
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        logging.info(f"Using model: {model_name}")
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logging.info("Client initialized successfully.")

        # Build full system instruction
        full_system = SYSTEM_PROMPT
        full_system += build_user_context(user_profile)
        full_system += build_exercise_context(relevant_exercises)

        # Build conversation history
        contents = []

        # Add recent chat history (last 10 messages)
        if chat_history:
            recent = chat_history[-10:]
            for msg in recent:
                role = "user" if msg.get("role") == "user" else "model"
                content_text = msg.get("content", "")
                if content_text:
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=content_text)]
                        )
                    )

        # Add current user message
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_message)]
            )
        )

        # Generate response asynchronously
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        response = await client.aio.models.generate_content(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=full_system,
                temperature=0.7,
                max_output_tokens=8192,
            ),
        )

        return response.text

    except Exception as e:
        import logging
        import traceback
        logging.error("=== GEMINI DEPLOYMENT EXCEPTION ===")
        logging.error(f"Error Type: {type(e).__name__}")
        logging.error(f"Error Message: {str(e)}")
        logging.error(traceback.format_exc())
        return (
            "I'm sorry, I'm having trouble processing your request right now. "
            "Please try again in a moment."
        )
