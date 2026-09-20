import crypto from "crypto";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(adminId: number): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${adminId}.${expiresAt}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [id, expiresAt, signature] = token.split(".");
  if (!id || !expiresAt || !signature) return false;

  const expected = sign(`${id}.${expiresAt}`);
  const signaturesMatch =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!signaturesMatch) return false;
  return Date.now() < Number(expiresAt);
}

export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
