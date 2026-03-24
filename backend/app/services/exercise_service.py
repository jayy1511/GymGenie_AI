"""
GymGenie AI — Exercise Service (ML + Dataset)
Loads trained ML model and provides exercise search/recommendation.
"""
import os
import pandas as pd
import joblib
from typing import List, Optional
from pathlib import Path


class ExerciseService:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.df = None
        self._loaded = False

    def load(self, artifacts_path: str = None, dataset_path: str = None):
        """Load ML artifacts and exercise dataset."""
        # Determine paths
        base_dir = Path(__file__).resolve().parent.parent.parent.parent  # project root
        if artifacts_path is None:
            artifacts_path = str(base_dir / "ml" / "artifacts")
        if dataset_path is None:
            dataset_path = str(base_dir / "Dataset" / "megaGymDataset.csv")

        # Load ML model artifacts
        model_path = os.path.join(artifacts_path, "model.joblib")
        vectorizer_path = os.path.join(artifacts_path, "vectorizer.joblib")
        label_encoder_path = os.path.join(artifacts_path, "label_encoder.joblib")

        if all(os.path.exists(p) for p in [model_path, vectorizer_path, label_encoder_path]):
            self.model = joblib.load(model_path)
            self.vectorizer = joblib.load(vectorizer_path)
            self.label_encoder = joblib.load(label_encoder_path)
            print("✅ ML model loaded successfully")
        else:
            print("⚠️  ML artifacts not found — exercise intelligence will use dataset filtering only")

        # Load dataset
        if os.path.exists(dataset_path):
            self.df = pd.read_csv(dataset_path)
            self.df.columns = self.df.columns.str.strip()
            # Clean data
            self.df["Title"] = self.df["Title"].fillna("")
            self.df["Desc"] = self.df["Desc"].fillna("")
            self.df["BodyPart"] = self.df["BodyPart"].fillna("Unknown")
            self.df["Equipment"] = self.df["Equipment"].fillna("Unknown")
            self.df["Level"] = self.df["Level"].fillna("Intermediate")
            self.df["Type"] = self.df["Type"].fillna("Strength")
            self.df["combined_text"] = (self.df["Title"] + " " + self.df["Desc"]).str.lower()
            print(f"✅ Exercise dataset loaded: {len(self.df)} exercises")
        else:
            print(f"⚠️  Dataset not found at {dataset_path}")

        self._loaded = True

    def predict_body_part(self, query: str) -> Optional[str]:
        """Use ML model to predict the most relevant body part for a query."""
        if self.model is None or self.vectorizer is None:
            return None
        try:
            features = self.vectorizer.transform([query.lower()])
            prediction = self.model.predict(features)[0]
            if self.label_encoder:
                return self.label_encoder.inverse_transform([prediction])[0]
            return prediction
        except Exception as e:
            print(f"ML prediction error: {e}")
            return None

    def search_exercises(
        self,
        query: str = None,
        body_part: str = None,
        equipment: str = None,
        level: str = None,
        limit: int = 10,
    ) -> List[dict]:
        """Search exercises using dataset filtering + ML-based ranking."""
        if self.df is None:
            return []

        filtered = self.df.copy()

        # Filter by body part
        if body_part:
            filtered = filtered[
                filtered["BodyPart"].str.lower().str.contains(body_part.lower(), na=False)
            ]

        # Filter by equipment
        if equipment:
            filtered = filtered[
                filtered["Equipment"].str.lower().str.contains(equipment.lower(), na=False)
            ]

        # Filter by level
        if level:
            filtered = filtered[
                filtered["Level"].str.lower().str.contains(level.lower(), na=False)
            ]

        # Text search in title + description
        if query:
            query_lower = query.lower()
            filtered = filtered[
                filtered["combined_text"].str.contains(query_lower, na=False)
            ]

        # If we still have too many or query didn't match, use ML prediction
        if len(filtered) == 0 and query and self.model:
            predicted_bp = self.predict_body_part(query)
            if predicted_bp:
                filtered = self.df[
                    self.df["BodyPart"].str.lower() == predicted_bp.lower()
                ]

        # Sort by rating if available
        if "Rating" in filtered.columns:
            filtered = filtered.sort_values("Rating", ascending=False, na_position="last")

        # Limit results
        results = filtered.head(limit)

        return [
            {
                "title": row.get("Title", ""),
                "description": str(row.get("Desc", ""))[:200],
                "type": row.get("Type", ""),
                "body_part": row.get("BodyPart", ""),
                "equipment": row.get("Equipment", ""),
                "level": row.get("Level", ""),
                "rating": row.get("Rating", None),
            }
            for _, row in results.iterrows()
        ]

    def get_relevant_exercises(self, query: str, user_profile: dict = None, limit: int = 8) -> List[dict]:
        """Get exercises relevant to a user query, considering their profile."""
        # Extract signals from query
        body_part = self.predict_body_part(query) if self.model else None

        # Extract level from user profile
        level = None
        if user_profile:
            level = user_profile.get("experience_level")

        # Search with extracted signals
        exercises = self.search_exercises(
            query=query,
            body_part=body_part,
            level=level,
            limit=limit,
        )

        # If no results, broaden search
        if not exercises:
            exercises = self.search_exercises(
                body_part=body_part,
                limit=limit,
            )

        # Still no results? Just get top-rated
        if not exercises:
            exercises = self.search_exercises(limit=limit)

        return exercises


# Singleton instance
exercise_service = ExerciseService()
