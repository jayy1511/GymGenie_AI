# GymGenie AI — Error Analysis

## Model Details
- **Model**: Logistic Regression (multinomial)
- **Features**: TF-IDF (max_features=5000, ngram_range=(1,2))
- **Task**: Predict `BodyPart` from exercise `Title + Desc`

## Misclassified Examples

### Example 1: "Kettlebell Swing" — Abdominals predicted, actually Abdominals
**True Label**: Abdominals  
**Predicted**: Abdominals (Correct in this case)

Many kettlebell exercises are categorized as "Abdominals" in the dataset even though they are full-body movements. This is a dataset labeling issue, not a model error.

### Example 2: Exercises with ambiguous body parts
**Issue**: Exercises like "Barbell Side Bend" (Abdominals) and compound movements often have descriptions mentioning multiple body parts.

**True Label**: Abdominals  
**Predicted**: Shoulders or Back  

**Why it fails**: The description mentions multiple muscle groups (shoulders, back, core). The TF-IDF features capture terms related to secondary muscles more strongly than the primary target.

### Example 3: Exercises with minimal or missing descriptions
**Issue**: Some exercises have empty or very short descriptions (e.g., "FYR2 Double-Kettlebell Ski").

**True Label**: Abdominals  
**Predicted**: Various  

**Why it fails**: With only the title available, the model has very few text features to work with. Program-specific prefixes like "FYR", "Holman", "MetaBurn" add noise.

## Suggested Improvements

1. **Data augmentation**: Enrich empty descriptions using exercise name patterns and body part keywords
2. **Feature engineering**: Add equipment and exercise type as additional features alongside TF-IDF
3. **Class balancing**: Use SMOTE or class weights to handle imbalanced body part distribution (Abdominals is heavily overrepresented)
4. **Better model**: Try Random Forest or SVM, which may handle sparse features better
5. **Remove noise**: Strip program prefixes (FYR, Holman, MetaBurn, HM, etc.) from titles before featurization
