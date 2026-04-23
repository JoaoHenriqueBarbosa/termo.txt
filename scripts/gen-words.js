#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DICT_PATH = path.join(ROOT, "data", "br-utf8.txt");
const OUT_PATH = path.join(ROOT, "public", "words.json");

const normalize = (w) =>
  w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Read dictionary
const raw = fs.readFileSync(DICT_PATH, "utf8");
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// Filter 5-letter words, dedup by normalized form
const seen = new Set();
const valid = [];

for (const word of lines) {
  const lower = word.toLowerCase();
  const norm = normalize(lower);
  if (norm.length !== 5) continue;
  if (!/^[a-z]+$/.test(norm)) continue;
  if (seen.has(norm)) continue;
  seen.add(norm);
  valid.push(lower);
}

valid.sort((a, b) => normalize(a).localeCompare(normalize(b)));

// Preserve existing answers if file exists
let answers = [];
if (fs.existsSync(OUT_PATH)) {
  try {
    const existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
    if (Array.isArray(existing.answers)) {
      // Keep only answers that exist in the new valid set
      const validSet = new Set(valid.map(normalize));
      answers = existing.answers.filter((w) => validSet.has(normalize(w)));
    }
  } catch {}
}

// If no answers yet, pick a default subset (common words)
if (!answers.length) {
  answers = valid.slice(0, 200);
}

// Dedup answers
const answerSeen = new Set();
answers = answers.filter((w) => {
  const n = normalize(w);
  if (answerSeen.has(n)) return false;
  answerSeen.add(n);
  return true;
});

fs.writeFileSync(OUT_PATH, JSON.stringify({ answers, valid }, null, 2) + "\n");

console.log(`answers: ${answers.length}`);
console.log(`valid:   ${valid.length}`);
console.log(`written: ${OUT_PATH}`);
