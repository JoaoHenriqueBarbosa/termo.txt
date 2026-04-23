import path from "node:path";
import fs from "node:fs/promises";

function todayKey() {
  const t = new Date();
  return (
    t.getFullYear() +
    "-" +
    String(t.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(t.getDate()).padStart(2, "0")
  );
}

function seedFromDate(dateStr) {
  let hash = 0;
  for (const ch of dateStr) {
    hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

let cached = null;

async function loadWords() {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "words.json");
  const raw = await fs.readFile(file, "utf8");
  cached = JSON.parse(raw);
  return cached;
}

export async function GET() {
  const { answers } = await loadWords();
  const key = todayKey();
  const idx = seedFromDate(key) % answers.length;
  return Response.json({ word: answers[idx] });
}
