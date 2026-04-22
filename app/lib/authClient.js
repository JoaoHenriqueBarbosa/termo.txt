async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const authClient = {
  signup: (body) => postJson("/api/auth/signup", body),
  login: (body) => postJson("/api/auth/login", body),
  logout: () => postJson("/api/auth/logout", {}),
  me: async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return data.user ?? null;
  },
};
