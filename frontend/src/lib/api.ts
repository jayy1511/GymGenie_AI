import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  ProfileUpdate,
  ChatResponse,
  ChatSession,
  ChatSessionDetail,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // Profile
  async getProfile(): Promise<User> {
    return this.request<User>("/users/me");
  }

  async updateProfile(data: ProfileUpdate): Promise<User> {
    return this.request<User>("/users/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Chat
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async getChatHistory(limit: number = 20): Promise<ChatSession[]> {
    return this.request<ChatSession[]>(`/chat/history?limit=${limit}`);
  }

  async getChatSession(sessionId: string): Promise<ChatSessionDetail> {
    return this.request<ChatSessionDetail>(`/chat/history/${sessionId}`);
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.request(`/chat/history/${sessionId}`, { method: "DELETE" });
  }
}

export const api = new ApiClient();
