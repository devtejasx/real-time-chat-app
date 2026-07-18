import bcrypt from "bcryptjs";
import { env } from "../config/env";

/**
 * Password hashing helpers. Uses bcrypt (bcryptjs — a pure-JS, drop-in
 * implementation) so no native compilation is required in Docker/CI.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
