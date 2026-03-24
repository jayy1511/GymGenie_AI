# GymGenie AI — ML Pipeline

## Task Definition
**Multi-class classification**: Predict exercise `BodyPart` from `Title` + `Desc` text fields.

## Dataset
- **Source**: Kaggle megaGymDataset.csv (~2919 exercises)
- **Features**: TF-IDF on `Title + Desc` (combined text)
- **Target**: `BodyPart` (e.g., Abdominals, Biceps, Chest, Back, Shoulders, etc.)

## Preprocessing
1. Drop rows with missing `Title` or `BodyPart`
2. Remove duplicate titles
3. Fill missing `Desc` with empty string
4. Lowercase and combine `Title + Desc` for TF-IDF
5. Encode `BodyPart` with `LabelEncoder`

## Training
- **Model**: Logistic Regression (multinomial, lbfgs solver)
- **Features**: TF-IDF (max_features=5000, ngram_range=(1,2))
- **Split**: 70/15/15 (train/val/test), stratified, seed=42

## Evaluation
- Accuracy, Precision, Recall, F1 (weighted)
- Confusion matrix
- Per-class classification report

## Artifacts
Saved in `ml/artifacts/`:
- `model.joblib` — trained Logistic Regression model
- `vectorizer.joblib` — fitted TF-IDF vectorizer
- `label_encoder.joblib` — fitted label encoder
- `test_data.joblib` — held-out test set

## Commands

```bash
# 1. Prepare dataset
python ml/prepare_dataset.py

# 2. Train model
python ml/train.py --max_features 5000 --C 1.0 --seed 42

# 3. Evaluate on test set
python ml/evaluate.py
```

## CLI Arguments (train.py)
| Argument | Default | Description |
|----------|---------|-------------|
| `--data` | `ml/data/cleaned_exercises.csv` | Path to cleaned dataset |
| `--artifacts` | `ml/artifacts/` | Output directory for model artifacts |
| `--max_features` | 5000 | TF-IDF maximum features |
| `--C` | 1.0 | Logistic Regression regularization strength |
| `--seed` | 42 | Random seed for reproducibility |
| `--notes` | "" | Notes for experiment log |
