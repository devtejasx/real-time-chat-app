import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Environment schema. The process fails fast at startup if required variables
 * are missing or malformed, so misconfiguration never reaches runtime.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),

  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  SEED_ADMIN_EMAIL: z.string().email().default("admin@rats.dev"),
  SEED_ADMIN_PASSWORD: z.string().min(6).default("Admin@12345"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

/** Parsed list of allowed CORS origins. */
export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
