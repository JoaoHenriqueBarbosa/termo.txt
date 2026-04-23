import { cookies } from "next/headers";
import { db } from "../../lib/db";

export async function POST(request) {
  const { theme } = await request.json().catch(() => ({}));
  if (typeof theme !== "string") {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = db.findSessionUser(token);
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  db.updateUser(user.name, { theme });
  return Response.json({ ok: true });
}
