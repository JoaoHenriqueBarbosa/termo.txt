import path from "node:path";
import fs from "node:fs";

const DB_PATH = path.join(process.cwd(), "data", "termo.jsonl");

const state = { users: new Map(), sessions: new Map(), nextUserId: 1 };
let loaded = false;
let writeQueue = Promise.resolve();

const now = () => Math.floor(Date.now() / 1000);

function apply(event) {
  switch (event.type) {
    case "user_created":
      state.users.set(event.user.name, event.user);
      state.nextUserId = Math.max(state.nextUserId, event.user.id + 1);
      break;
    case "session_created":
      state.sessions.set(event.session.token, event.session);
      break;
    case "session_deleted":
      state.sessions.delete(event.token);
      break;
  }
}

function ensureLoaded() {
  if (loaded) return;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    for (const line of raw.split("\n")) {
      if (!line) continue;
      try {
        apply(JSON.parse(line));
      } catch {}
    }
  }
  loaded = true;
}

function append(event) {
  apply(event);
  const line = JSON.stringify(event) + "\n";
  writeQueue = writeQueue.then(() =>
    fs.promises.appendFile(DB_PATH, line),
  );
  return writeQueue;
}

export const db = {
  findUserByName(name) {
    ensureLoaded();
    return state.users.get(name) ?? null;
  },

  findUserById(id) {
    ensureLoaded();
    for (const u of state.users.values()) if (u.id === id) return u;
    return null;
  },

  createUser({ name, age, passwordHash }) {
    ensureLoaded();
    const user = {
      id: state.nextUserId,
      name,
      age,
      passwordHash,
      createdAt: now(),
    };
    append({ type: "user_created", user });
    return user;
  },

  createSession({ userId, token, expiresAt }) {
    ensureLoaded();
    const session = { token, userId, createdAt: now(), expiresAt };
    append({ type: "session_created", session });
  },

  findSessionUser(token) {
    ensureLoaded();
    const session = state.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < now()) {
      this.deleteSession(token);
      return null;
    }
    return this.findUserById(session.userId);
  },

  deleteSession(token) {
    ensureLoaded();
    if (state.sessions.has(token)) {
      append({ type: "session_deleted", token });
    }
  },
};
