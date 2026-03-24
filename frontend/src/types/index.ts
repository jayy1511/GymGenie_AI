export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  workout_frequency?: string;
  injuries?: string;
  created_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  workout_frequency?: string;
  injuries?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  exercises_used?: ExerciseInfo[];
}

export interface ExerciseInfo {
  title: string;
  description: string;
  type: string;
  body_part: string;
  equipment: string;
  level: string;
  rating?: number;
}

export interface ProfileUpdate {
  name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: string;
  experience_level?: string;
  workout_frequency?: string;
  injuries?: string;
}
