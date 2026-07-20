import crypto from "node:crypto";
import type { User } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

/** A user safe to return to clients (no password hash). */
export type SafeUser = Omit<User, "password">;

export interface AuthResult {
  token: string; // short-lived access token (JWT)
  refreshToken: string; // opaque, rotatable refresh token
  user: SafeUser;
}

function toSafeUser(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

/** Hash a refresh token before it touches the database. */
function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Convert a duration string like "7d" / "15m" / "3600s" to milliseconds. */
function durationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000; // sensible 7d fallback
  const n = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]]!;
  return n * unit;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashed = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashed,
      role: "VIEWER", // self-registered users start read-only
    });

    return this.issueTokens(user);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw ApiError.unauthorized("Invalid email or password");

    const valid = await comparePassword(input.password, user.password);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");

    return this.issueTokens(user);
  },

  /** Exchange a valid refresh token for a fresh pair (token rotation). */
  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const record = await refreshTokenRepository.findByHash(hashToken(rawRefreshToken));
    if (!record || record.revoked || record.expiresAt.getTime() < Date.now()) {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    // Rotation: the presented token is single-use.
    await refreshTokenRepository.revoke(record.id);

    const user = await userRepository.findById(record.userId);
    if (!user) throw ApiError.unauthorized("Account no longer exists");

    return this.issueTokens(user);
  },

  /** Revoke a refresh token (logout). Idempotent. */
  async logout(rawRefreshToken: string): Promise<void> {
    await refreshTokenRepository.revokeByHash(hashToken(rawRefreshToken));
  },

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return toSafeUser(user);
  },

  /** Mint a new access + refresh token pair and persist the refresh hash. */
  async issueTokens(user: User): Promise<AuthResult> {
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = crypto.randomBytes(48).toString("hex");
    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN)),
    });
    return { token, refreshToken, user: toSafeUser(user) };
  },
};
