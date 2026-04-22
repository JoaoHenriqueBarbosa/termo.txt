export function createPacing(initialFast = false) {
  let fast = initialFast;
  const listeners = new Set();

  const sleep = (ms) =>
    new Promise((resolve) => {
      const start = performance.now();
      const id = setInterval(() => {
        const elapsed = performance.now() - start;
        const target = fast ? Math.min(ms, 2) : ms;
        if (elapsed >= target) {
          clearInterval(id);
          resolve();
        }
      }, 4);
    });

  return {
    sleep,
    isFast: () => fast,
    setFast(v) {
      fast = v;
      for (const l of listeners) l(fast);
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
