export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
  expiresAtUtc: string;
}

export interface AuthUser {
  username: string;
  userId: number;
  expiresAtUtc: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}
