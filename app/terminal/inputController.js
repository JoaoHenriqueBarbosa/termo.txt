import { ansi } from "./colors";

export function createInputController({ input }) {
  let buffer = "";
  let mask = false;
  let singleKey = null;
  let resolver = null;
  let onCommand = null;
  const history = [];
  let historyIdx = -1;
  let draft = "";

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

  const replaceBuffer = (text) => {
    const eraseLen = buffer.length;
    input.write("\b \b".repeat(eraseLen));
    buffer = text;
    input.write(mask ? "•".repeat(text.length) : text);
  };

  input.onData((data) => {
    if (!resolver && !onCommand) return;

    // Arrow up
    if (data === "\x1b[A") {
      if (!onCommand || !history.length) return;
      if (historyIdx === -1) draft = buffer;
      if (historyIdx < history.length - 1) {
        historyIdx++;
        replaceBuffer(history[history.length - 1 - historyIdx]);
      }
      return;
    }

    // Arrow down
    if (data === "\x1b[B") {
      if (!onCommand) return;
      if (historyIdx > 0) {
        historyIdx--;
        replaceBuffer(history[history.length - 1 - historyIdx]);
      } else if (historyIdx === 0) {
        historyIdx = -1;
        replaceBuffer(draft);
      }
      return;
    }

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
        if (onCommand && value.trim()) {
          history.push(value);
        }
        historyIdx = -1;
        draft = "";
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
