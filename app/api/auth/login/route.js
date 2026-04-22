import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { createSession, setSessionCookie } from "../../../lib/session";

export async function POST(request) {
  const { name, password } = await request.json().catch(() => ({}));

  if (typeof name !== "string" || typeof password !== "string") {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const user = db.findUserByName(name.trim());
  if (!user) {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const { token, expiresAt } = createSession(user.id);
  await setSessionCookie(token, expiresAt);

  return Response.json({
    user: { id: user.id, name: user.name, age: user.age },
  });
}
