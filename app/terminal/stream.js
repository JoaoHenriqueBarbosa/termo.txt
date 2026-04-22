function* tokenize(text) {
  const re = /\s+|\S+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const word = m[0];
    if (/\s/.test(word)) {
      yield word;
      continue;
    }
    let i = 0;
    while (i < word.length) {
      const size = Math.min(word.length - i, 1 + Math.floor(Math.random() * 4));
      yield word.slice(i, i + size);
      i += size;
    }
  }
}

export function createStreamer({ write, sleep, isCancelled }) {
  return async function streamTokens(text, { newline = true } = {}) {
    for (const tok of tokenize(text)) {
      if (isCancelled()) break;
      write(tok);
      await sleep(20 + Math.random() * 60);
    }
    if (newline) write("\r\n");
  };
}
