import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const generateToken = () => randomBytes(32).toString("hex");

export function createSession(userId) {
  const token = generateToken();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  db.createSession({ userId, token, expiresAt });
  return { token, expiresAt };
}

export async function setSessionCookie(token, expiresAt) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt * 1000),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const user = db.findSessionUser(token);
  if (!user) return null;
  return { id: user.id, name: user.name, age: user.age, theme: user.theme };
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) db.deleteSession(token);
  await clearSessionCookie();
}
