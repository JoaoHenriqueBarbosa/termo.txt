import { ansi } from "./colors";

export function createInputController({ input }) {
  let buffer = "";
  let mask = false;
  let singleKey = null;
  let resolver = null;
  let onCommand = null;

  const writePrompt = (label) => {
    input.reset();
    input.write(`${ansi.green}${label}${ansi.reset}`);
  };
  const clear = () => writePrompt("");

  const setMode = (_name, { mask: m = false, singleKey: sk = null } = {}) => {
    mask = m;
    singleKey = sk;
  };

  const readNext = () =>
    new Promise((resolve) => {
      buffer = "";
      resolver = resolve;
    });

  const submit = (value) => {
    const r = resolver;
    resolver = null;
    r?.(value);
  };

  input.onData((data) => {
    if (!resolver && !onCommand) return;
    for (const ch of data) {
      const code = ch.charCodeAt(0);

      if (singleKey && resolver && ch.length === 1 && code >= 32) {
        const k = ch.toLowerCase();
        if (singleKey.includes(k)) {
          submit(k);
          return;
        }
        continue;
      }

      if (ch === "\r") {
        const value = buffer;
        buffer = "";
        if (resolver) submit(value);
        else onCommand?.(value);
      } else if (code === 127) {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          input.write("\b \b");
        }
      } else if (code >= 32) {
        buffer += ch;
        input.write(mask ? "•" : ch);
      }
    }
  });

  const setOnCommand = (fn) => {
    onCommand = fn;
  };

  return { writePrompt, clear, setMode, readNext, setOnCommand };
}
