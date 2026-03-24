"""
GymGenie AI — Model Training
Train a BodyPart classifier using TF-IDF + Logistic Regression.
"""
import argparse
import os
import csv
import uuid
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)


def set_seeds(seed: int = 42):
    """Set all random seeds for reproducibility."""
    np.random.seed(seed)
    import random
    random.seed(seed)


def train_model(
    data_path: str,
    artifacts_dir: str,
    max_features: int = 5000,
    C: float = 1.0,
    seed: int = 42,
    notes: str = "",
):
    """Train the BodyPart classifier."""
    set_seeds(seed)
    print("=" * 60)
    print("  GymGenie AI — Model Training")
    print("=" * 60)

    # --- 1. Load Dataset ---
    print(f"\n📂 Loading cleaned dataset from: {data_path}")
    df = pd.read_csv(data_path)

    # Ensure combined_text exists
    if "combined_text" not in df.columns:
        df["combined_text"] = (df["Title"].fillna("") + " " + df["Desc"].fillna("")).str.lower()

    # Drop rows with empty combined text
    df = df[df["combined_text"].str.strip() != ""]
    print(f"   Dataset size: {len(df)} exercises")

    # --- 2. Encode Target Variable ---
    label_encoder = LabelEncoder()
    df["body_part_encoded"] = label_encoder.fit_transform(df["BodyPart"])
    n_classes = len(label_encoder.classes_)
    print(f"   Number of body part classes: {n_classes}")
    print(f"   Classes: {list(label_encoder.classes_)}")

    # --- 3. Feature Extraction (TF-IDF) ---
    print(f"\n🔧 TF-IDF vectorization (max_features={max_features})...")
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
    )

    X = vectorizer.fit_transform(df["combined_text"])
    y = df["body_part_encoded"].values
    print(f"   Feature matrix shape: {X.shape}")

    # --- 4. Train/Validation/Test Split (70/15/15) ---
    print(f"\n📊 Splitting data (70/15/15, seed={seed})...")

    # First split: 70% train, 30% temp
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=seed, stratify=y,
    )

    # Second split: 50/50 of temp = 15/15 of total
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=seed, stratify=y_temp,
    )

    print(f"   Train: {X_train.shape[0]} samples")
    print(f"   Validation: {X_val.shape[0]} samples")
    print(f"   Test: {X_test.shape[0]} samples")

    # --- 5. Model Training ---
    print(f"\n🚀 Training Logistic Regression (C={C})...")
    model = LogisticRegression(
        C=C,
        max_iter=1000,
        random_state=seed,
        multi_class="multinomial",
        solver="lbfgs",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print("   ✅ Model trained successfully")

    # --- 6. Evaluation on Validation Set ---
    print("\n📈 Validation Results:")
    y_val_pred = model.predict(X_val)

    val_accuracy = accuracy_score(y_val, y_val_pred)
    val_precision = precision_score(y_val, y_val_pred, average="weighted", zero_division=0)
    val_recall = recall_score(y_val, y_val_pred, average="weighted", zero_division=0)
    val_f1 = f1_score(y_val, y_val_pred, average="weighted", zero_division=0)

    print(f"   Accuracy:  {val_accuracy:.4f}")
    print(f"   Precision: {val_precision:.4f}")
    print(f"   Recall:    {val_recall:.4f}")
    print(f"   F1 Score:  {val_f1:.4f}")

    print("\n   Classification Report (Validation):")
    print(classification_report(
        y_val, y_val_pred,
        target_names=label_encoder.classes_,
        zero_division=0,
    ))

    # --- 7. Save Artifacts ---
    os.makedirs(artifacts_dir, exist_ok=True)

    model_path = os.path.join(artifacts_dir, "model.joblib")
    vectorizer_path = os.path.join(artifacts_dir, "vectorizer.joblib")
    label_encoder_path = os.path.join(artifacts_dir, "label_encoder.joblib")

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(label_encoder, label_encoder_path)

    # Save test data for evaluation script
    test_data_path = os.path.join(artifacts_dir, "test_data.joblib")
    joblib.dump({"X_test": X_test, "y_test": y_test}, test_data_path)

    print(f"\n💾 Artifacts saved to: {artifacts_dir}/")
    print(f"   - model.joblib")
    print(f"   - vectorizer.joblib")
    print(f"   - label_encoder.joblib")
    print(f"   - test_data.joblib")

    # --- 8. Experiment Logging ---
    run_id = str(uuid.uuid4())[:8]
    log_path = os.path.join(Path(__file__).parent, "experiment_log.csv")
    log_exists = os.path.exists(log_path)

    with open(log_path, "a", newline="") as f:
        writer = csv.writer(f)
        if not log_exists:
            writer.writerow([
                "run_id", "timestamp", "model", "hyperparameters",
                "validation_f1", "validation_accuracy", "notes",
            ])
        writer.writerow([
            run_id,
            datetime.now().isoformat(),
            "LogisticRegression",
            f"C={C}, max_features={max_features}, seed={seed}",
            f"{val_f1:.4f}",
            f"{val_accuracy:.4f}",
            notes or "baseline run",
        ])

    print(f"\n📝 Logged experiment run: {run_id}")
    print("=" * 60)

    return {
        "val_accuracy": val_accuracy,
        "val_precision": val_precision,
        "val_recall": val_recall,
        "val_f1": val_f1,
    }


def main():
    parser = argparse.ArgumentParser(description="Train GymGenie exercise classifier")
    parser.add_argument(
        "--data",
        type=str,
        default=str(Path(__file__).parent / "data" / "cleaned_exercises.csv"),
        help="Path to cleaned dataset CSV",
    )
    parser.add_argument(
        "--artifacts",
        type=str,
        default=str(Path(__file__).parent / "artifacts"),
        help="Directory to save model artifacts",
    )
    parser.add_argument("--max_features", type=int, default=5000, help="TF-IDF max features")
    parser.add_argument("--C", type=float, default=1.0, help="Logistic Regression regularization")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--notes", type=str, default="", help="Notes for experiment log")

    args = parser.parse_args()

    train_model(
        data_path=args.data,
        artifacts_dir=args.artifacts,
        max_features=args.max_features,
        C=args.C,
        seed=args.seed,
        notes=args.notes,
    )


if __name__ == "__main__":
    main()
