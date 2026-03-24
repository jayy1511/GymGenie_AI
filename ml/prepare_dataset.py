"""
GymGenie AI — Dataset Preparation
Loads, cleans, and prepares the Kaggle gym exercise dataset for ML training.
"""
import argparse
import os
import pandas as pd
import numpy as np
from pathlib import Path


def load_and_clean_dataset(input_path: str, output_path: str = None) -> pd.DataFrame:
    """
    Load the megaGymDataset.csv and perform cleaning steps.
    
    Expected schema:
        - (unnamed index column)
        - Title: exercise name
        - Desc: exercise description
        - Type: exercise type (Strength, Stretching, Plyometrics, etc.)
        - BodyPart: target muscle group
        - Equipment: required equipment
        - Level: difficulty level (Beginner, Intermediate, Expert)
        - Rating: user rating (float)
        - RatingDesc: rating description
    """
    print(f"📂 Loading dataset from: {input_path}")
    df = pd.read_csv(input_path)
    print(f"   Raw shape: {df.shape}")

    # Clean column names
    df.columns = df.columns.str.strip()

    # Drop unnamed index column if present
    if df.columns[0] == "" or "Unnamed" in df.columns[0]:
        df = df.drop(columns=[df.columns[0]])

    # --- Data Cleaning ---

    # 1. Drop rows with missing Title (essential field)
    before = len(df)
    df = df.dropna(subset=["Title"])
    print(f"   Dropped {before - len(df)} rows with missing Title")

    # 2. Drop rows with missing BodyPart (our target variable)
    before = len(df)
    df = df.dropna(subset=["BodyPart"])
    print(f"   Dropped {before - len(df)} rows with missing BodyPart")

    # 3. Remove duplicates based on Title
    before = len(df)
    df = df.drop_duplicates(subset=["Title"], keep="first")
    print(f"   Dropped {before - len(df)} duplicate titles")

    # 4. Fill missing descriptions with empty string
    df["Desc"] = df["Desc"].fillna("")

    # 5. Clean text fields
    df["Title"] = df["Title"].str.strip()
    df["Desc"] = df["Desc"].str.strip()
    df["BodyPart"] = df["BodyPart"].str.strip()
    df["Equipment"] = df["Equipment"].fillna("None").str.strip()
    df["Level"] = df["Level"].fillna("Intermediate").str.strip()
    df["Type"] = df["Type"].fillna("Strength").str.strip()

    # 6. Create combined text feature (lowercase for TF-IDF)
    df["combined_text"] = (df["Title"] + " " + df["Desc"]).str.lower()

    # 7. Parse Rating to float
    df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce")

    # --- Summary ---
    print(f"\n✅ Cleaned dataset shape: {df.shape}")
    print(f"\n📊 BodyPart distribution:")
    print(df["BodyPart"].value_counts().to_string())
    print(f"\n📊 Level distribution:")
    print(df["Level"].value_counts().to_string())
    print(f"\n📊 Equipment (top 10):")
    print(df["Equipment"].value_counts().head(10).to_string())

    # Save cleaned dataset
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"\n💾 Saved cleaned dataset to: {output_path}")

    return df


def main():
    parser = argparse.ArgumentParser(description="Prepare the gym exercise dataset")
    parser.add_argument(
        "--input",
        type=str,
        default=str(Path(__file__).parent.parent / "Dataset" / "megaGymDataset.csv"),
        help="Path to raw dataset CSV",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(Path(__file__).parent / "data" / "cleaned_exercises.csv"),
        help="Path to save cleaned dataset",
    )
    args = parser.parse_args()

    load_and_clean_dataset(args.input, args.output)


if __name__ == "__main__":
    main()
