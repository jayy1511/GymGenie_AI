"""
GymGenie AI — Model Evaluation
Evaluate the trained BodyPart classifier on the held-out test set.
"""
import argparse
import os
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)


def evaluate_model(artifacts_dir: str):
    """Run evaluation on the test set using saved artifacts."""
    print("=" * 60)
    print("  GymGenie AI — Model Evaluation (Test Set)")
    print("=" * 60)

    # Load artifacts
    model = joblib.load(os.path.join(artifacts_dir, "model.joblib"))
    label_encoder = joblib.load(os.path.join(artifacts_dir, "label_encoder.joblib"))
    test_data = joblib.load(os.path.join(artifacts_dir, "test_data.joblib"))

    X_test = test_data["X_test"]
    y_test = test_data["y_test"]

    print(f"\n📊 Test set size: {X_test.shape[0]} samples")
    print(f"   Number of classes: {len(label_encoder.classes_)}")

    # Predict
    y_pred = model.predict(X_test)

    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"\n📈 Test Results:")
    print(f"   Accuracy:  {accuracy:.4f}")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall:    {recall:.4f}")
    print(f"   F1 Score:  {f1:.4f}")

    # Classification Report
    print(f"\n📋 Classification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_,
        zero_division=0,
    ))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\n🔢 Confusion Matrix:")
    print(f"   Classes: {list(label_encoder.classes_)}")

    # Pretty-print confusion matrix
    cm_df = pd.DataFrame(
        cm,
        index=label_encoder.classes_,
        columns=label_encoder.classes_,
    )
    print(cm_df.to_string())

    # Find misclassified examples for error analysis
    print(f"\n❌ Misclassified Examples:")
    misclassified_indices = np.where(y_test != y_pred)[0]
    print(f"   Total misclassified: {len(misclassified_indices)} / {len(y_test)}")

    if len(misclassified_indices) > 0:
        for i, idx in enumerate(misclassified_indices[:5]):
            true_label = label_encoder.inverse_transform([y_test[idx]])[0]
            pred_label = label_encoder.inverse_transform([y_pred[idx]])[0]
            print(f"\n   Example {i+1}:")
            print(f"     True: {true_label}")
            print(f"     Predicted: {pred_label}")

    print("\n" + "=" * 60)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


def main():
    parser = argparse.ArgumentParser(description="Evaluate GymGenie exercise classifier")
    parser.add_argument(
        "--artifacts",
        type=str,
        default=str(Path(__file__).parent / "artifacts"),
        help="Directory containing model artifacts",
    )
    args = parser.parse_args()
    evaluate_model(args.artifacts)


if __name__ == "__main__":
    main()
