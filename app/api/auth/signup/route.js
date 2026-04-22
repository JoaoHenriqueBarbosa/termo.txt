import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { createSession, setSessionCookie } from "../../../lib/session";

export async function POST(request) {
  const { name, age, password } = await request.json().catch(() => ({}));

  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "invalid_name" }, { status: 400 });
  }
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum <= 0 || ageNum > 120) {
    return Response.json({ error: "invalid_age" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 4) {
    return Response.json({ error: "weak_password" }, { status: 400 });
  }

  const trimmed = name.trim();
  if (db.findUserByName(trimmed)) {
    return Response.json({ error: "name_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = db.createUser({ name: trimmed, age: ageNum, passwordHash });

  const { token, expiresAt } = createSession(user.id);
  await setSessionCookie(token, expiresAt);

  return Response.json({
    user: { id: user.id, name: user.name, age: user.age },
  });
}
