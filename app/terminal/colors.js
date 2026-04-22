export const ansi = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  fg: "\x1b[37m",
  dim: "\x1b[90m",
};

export const paint = (color, text) => `${color}${text}${ansi.reset}`;
