import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getMember, type Member } from "./db";

export const SESSION_COOKIE_NAME = "veil_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

interface SessionClaims {
  uid: string;
  exp: number;
}

const g = globalThis as { __VEIL_SESSION_SECRET?: string };

function secret(): string {
  if (!g.__VEIL_SESSION_SECRET) {
    g.__VEIL_SESSION_SECRET =
      process.env.VEIL_SESSION_SECRET ?? randomBytes(32).toString("hex");
  }
  return g.__VEIL_SESSION_SECRET;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function createSessionToken(member: Member): string {
  const claims: SessionClaims = {
    uid: member.id,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function readSessionToken(
  token: string | null | undefined,
): Promise<Member | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sign(payload), sig)) return null;
  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessionClaims;
    if (
      typeof claims.uid !== "string" ||
      typeof claims.exp !== "number" ||
      claims.exp < Date.now()
    ) {
      return null;
    }
    return await getMember(claims.uid);
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS): {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}