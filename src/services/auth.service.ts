import { apiPost, apiGet } from "./axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

/** Frontend auth API (Feature 7). */
export const authApi = {
  login(email: string, password: string): Promise<AuthPayload> {
    return apiPost<AuthPayload>("/auth/login", { email, password });
  },

  register(name: string, email: string, password: string): Promise<AuthPayload> {
    return apiPost<AuthPayload>("/auth/register", { name, email, password });
  },

  logout(refreshToken: string): Promise<unknown> {
    return apiPost("/auth/logout", { refreshToken });
  },

  me(): Promise<AuthUser> {
    return apiGet<AuthUser>("/auth/me");
  },
};
