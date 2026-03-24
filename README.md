# GymGenie AI

GymGenie AI is a full-stack fitness assistant web application that combines conversational AI with machine learning to deliver personalized exercise recommendations and training guidance. Users create a fitness profile, and the system uses that context alongside a trained exercise classification model to ground its responses in a real dataset of 2,900+ exercises.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [System Flow](#system-flow)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Architecture Overview

The application follows a three-tier architecture:

1. **Frontend** -- A Next.js 16 single-page application that handles user authentication, profile management, and a real-time chat interface.
2. **Backend** -- A FastAPI REST API server that manages user data, chat sessions, and orchestrates the AI response pipeline.
3. **ML Pipeline** -- An offline training pipeline that produces a serialized text classification model, consumed by the backend at runtime.

When a user sends a message, the backend performs the following sequence:

```
User Message
    |
    v
ML Classifier (TF-IDF + Logistic Regression)
    |
    v
Body Part Prediction (e.g., "Chest")
    |
    v
Dataset Lookup (filter exercises by predicted body part)
    |
    v
Context Assembly (user profile + matched exercises + chat history)
    |
    v
Google Gemini API (generates response with injected context)
    |
    v
Response returned to frontend
```

This design ensures that AI responses are grounded in a real exercise database rather than relying solely on the language model's general knowledge.

---

## Technology Stack

| Component         | Technology                                           |
|-------------------|------------------------------------------------------|
| Frontend          | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui      |
| Charts            | Recharts (integrated via shadcn chart component)     |
| Backend           | FastAPI (Python), Uvicorn                            |
| Database          | MongoDB (async via Motor)                            |
| Authentication    | JWT (python-jose), bcrypt password hashing (passlib) |
| AI Model          | Google Gemini 2.5 Flash (via google-genai SDK)       |
| ML Classification | scikit-learn (TF-IDF Vectorizer + Logistic Regression) |
| Data Processing   | pandas, NumPy, joblib                                |

---

## Project Structure

```
GymGenie-AI/
|
|-- frontend/                     Next.js application
|   |-- src/
|   |   |-- app/                  Route-based pages
|   |   |   |-- page.tsx          Landing page
|   |   |   |-- login/            Authentication
|   |   |   |-- signup/           Registration (multi-step form)
|   |   |   |-- dashboard/       Dashboard with charts and stats
|   |   |   |-- chat/             AI chat interface
|   |   |   |-- profile/          User profile management
|   |   |-- components/           Reusable UI components
|   |   |   |-- ui/               shadcn/ui primitives (card, button, chart, etc.)
|   |   |   |-- navbar.tsx        Navigation bar
|   |   |   |-- theme-toggle.tsx  Dark/light mode toggle
|   |   |-- lib/                  Utilities
|   |   |   |-- api.ts            Backend API client
|   |   |   |-- auth-context.tsx  Authentication state provider
|   |   |-- types/                TypeScript type definitions
|
|-- backend/                      FastAPI application
|   |-- app/
|   |   |-- main.py               Application entry point, CORS, lifespan
|   |   |-- core/
|   |   |   |-- config.py         Environment variable loading
|   |   |   |-- security.py       JWT token creation and validation
|   |   |-- db/
|   |   |   |-- database.py       MongoDB connection and index setup
|   |   |-- routes/
|   |   |   |-- auth.py           Registration and login endpoints
|   |   |   |-- users.py          Profile retrieval and update
|   |   |   |-- chat.py           Chat message handling, session CRUD
|   |   |   |-- health.py         Health check endpoint
|   |   |-- schemas/              Pydantic request/response models
|   |   |-- services/
|   |   |   |-- gemini_service.py Gemini API integration, prompt construction
|   |   |   |-- exercise_service.py ML model loading, exercise retrieval
|   |-- requirements.txt
|   |-- .env.example
|
|-- ml/                           Machine learning pipeline
|   |-- prepare_dataset.py        Data cleaning and preprocessing
|   |-- train.py                  Model training script
|   |-- evaluate.py               Model evaluation and metrics
|   |-- artifacts/                Serialized model files
|   |   |-- model.joblib          Trained Logistic Regression classifier
|   |   |-- vectorizer.joblib     Fitted TF-IDF vectorizer
|   |   |-- label_encoder.joblib  Label encoder for body part classes
|   |   |-- test_data.joblib      Held-out test set for evaluation
|   |-- data/                     Processed dataset (CSV)
|
|-- Dataset/                      Raw Kaggle gym exercise dataset
```

---

## Machine Learning Pipeline

### Objective

Classify free-text user queries into body part categories (e.g., Chest, Back, Legs, Shoulders, Arms, Core) so the system can retrieve relevant exercises from the dataset and inject them as context into the AI prompt.

### Dataset

The training data comes from the [Gym Exercise Dataset](https://www.kaggle.com/) on Kaggle, containing approximately 2,900 exercises with the following fields:

| Field       | Description                              |
|-------------|------------------------------------------|
| Title       | Exercise name                            |
| BodyPart    | Target muscle group (classification label) |
| Equipment   | Required equipment                       |
| Level       | Difficulty (Beginner, Intermediate, Expert) |
| Description | Step-by-step exercise instructions       |

### Preprocessing (`prepare_dataset.py`)

1. Load raw CSV and handle missing values
2. Combine `Title` and `Description` into a single text feature
3. Encode `BodyPart` labels using `LabelEncoder`
4. Split into train (70%), validation (15%), and test (15%) sets with stratification
5. Export cleaned data for model training

### Training (`train.py`)

1. Vectorize text using `TfidfVectorizer` (5,000 features, unigrams + bigrams)
2. Train a `LogisticRegression` classifier (multi-class, one-vs-rest)
3. Serialize the trained model, vectorizer, label encoder, and test data to `ml/artifacts/`

### Evaluation (`evaluate.py`)

1. Load serialized artifacts
2. Predict on the held-out test set
3. Generate classification report (precision, recall, F1 per class)
4. Output confusion matrix for error analysis

### Integration with Backend

At server startup, `exercise_service.py` loads the serialized model artifacts. On each chat request:

1. The user's message is passed through the TF-IDF vectorizer
2. The classifier predicts the most likely body part
3. Exercises matching that body part are retrieved from the dataset
4. These exercises are formatted and appended to the Gemini system prompt

This ensures the AI references real, specific exercises rather than generating generic advice.

---

## System Flow

### User Registration and Profile Setup

1. User creates an account (email, password hashed with bcrypt)
2. User fills in a fitness profile: age, gender, height, weight, fitness goal, experience level, workout frequency, injuries
3. Profile data is stored in MongoDB and used to contextualize all future AI interactions

### Chat Interaction

1. User sends a message via the chat interface
2. Backend authenticates the request via JWT
3. ML model classifies the query and retrieves relevant exercises
4. User profile, chat history (last 10 messages), and matched exercises are assembled into the system prompt
5. The complete prompt is sent to Google Gemini 2.5 Flash
6. The AI response is stored in the chat session and returned to the frontend
7. Frontend renders the response with markdown formatting

### Dashboard

The dashboard provides an overview of the user's fitness profile through interactive charts:

- **Weekly Activity** -- Bar chart showing estimated workout minutes per day
- **Profile Completeness** -- Radial gauge indicating how much of the fitness profile is filled
- **Workout Split** -- Donut chart displaying recommended session distribution
- **Body Stats** -- Summary of physical measurements
- **Recent Conversations** -- Quick access to past chat sessions

---

## API Reference

### Authentication

| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/auth/register` | Create a new user account       |
| POST   | `/api/auth/login`    | Authenticate and receive a JWT  |
| GET    | `/api/auth/me`       | Get the current authenticated user |

### User Profile

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/users/me`         | Retrieve user profile    |
| PUT    | `/api/users/me/profile` | Update profile fields    |

### Chat

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/api/chat/message`         | Send a message and receive AI response |
| GET    | `/api/chat/history`         | List all chat sessions               |
| GET    | `/api/chat/history/:id`     | Get full conversation by session ID  |
| DELETE | `/api/chat/history/:id`     | Delete a chat session                |

### System

| Method | Endpoint       | Description    |
|--------|----------------|----------------|
| GET    | `/api/health`  | Health check   |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GymGenie-AI
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your configuration (see Environment Variables below).

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. ML Pipeline (first-time setup)

Run these scripts once to train the model and generate artifacts:

```bash
python ml/prepare_dataset.py
python ml/train.py
python ml/evaluate.py
```

The trained model files will be saved to `ml/artifacts/`. The backend loads these automatically on startup.

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Example                          |
|----------------|--------------------------------------|----------------------------------|
| MONGODB_URL    | MongoDB connection string            | `mongodb://localhost:27017`       |
| DATABASE_NAME  | Database name                        | `gymgenie`                       |
| JWT_SECRET     | Secret key for JWT token signing     | (any secure random string)       |
| GEMINI_API_KEY | Google Gemini API key                | (from Google AI Studio)          |
| FRONTEND_URL   | Frontend origin for CORS             | `http://localhost:3000`          |

### Frontend (`frontend/.env.local`)

| Variable            | Description              | Example                          |
|---------------------|--------------------------|----------------------------------|
| NEXT_PUBLIC_API_URL | Backend API base URL     | `http://localhost:8000/api`      |

---

## Deployment

### Frontend

Deploy to Vercel:

```bash
cd frontend
npx vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL in the Vercel environment variables.

### Backend

Deploy to Render, Railway, or any platform supporting Python:

1. Set all environment variables from the table above
2. Set the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Ensure `ml/artifacts/` is included in the deployment (the backend loads model files from this directory)

### Database

Use MongoDB Atlas for a managed cloud database. Update `MONGODB_URL` with the Atlas connection string.

---

## License

This project was built for educational and learning purposes.
