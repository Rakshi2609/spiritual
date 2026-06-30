import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/* ----------------------------------------------------------------------------
   Minimal session layer: a signed JWT stored in an httpOnly cookie.
   Not a full auth framework — enough for a real, persisted login/signup.
---------------------------------------------------------------------------- */

const COOKIE = "lumiere_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-insecure-secret-change-me-in-env-local"
);

export type SessionUser = { id: string; email: string; name: string };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE);
}
