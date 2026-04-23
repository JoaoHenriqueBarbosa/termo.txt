export function normalize(word) {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function evaluate(guess, answer) {
  const g = [...normalize(guess)];
  const a = [...normalize(answer)];
  const result = Array(5).fill("absent");
  const remaining = [...a];

  // First pass: mark correct
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  // Second pass: mark present (no double-counting)
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const idx = remaining.indexOf(g[i]);
    if (idx !== -1) {
      result[i] = "present";
      remaining[idx] = null;
    }
  }

  return result;
}
