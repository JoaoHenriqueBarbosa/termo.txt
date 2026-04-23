const LINK_ID = "termo-theme";
const COOKIE_NAME = "theme";

const KEYS = [
  "ansi-0", "ansi-1", "ansi-2", "ansi-3", "ansi-4", "ansi-5",
  "ansi-6", "ansi-7", "ansi-8", "ansi-9", "ansi-10", "ansi-11",
  "ansi-12", "ansi-13", "ansi-14", "ansi-15",
  "background", "foreground", "cursor", "cursor-text",
  "selection-background", "selection-foreground",
];

export const DEFAULT_THEME = "GitS";

const themeUrl = (name) =>
  `/themes/css/${encodeURIComponent(name)}.css`;

export async function fetchThemeList() {
  const res = await fetch("/themes/index.json");
  return res.json();
}

export function loadTheme(name) {
  return new Promise((resolve, reject) => {
    let link = document.getElementById(LINK_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const url = themeUrl(name);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(name)}; path=/; max-age=31536000; samesite=lax`;
    if (link.getAttribute("href") === url) {
      resolve(readPalette());
      return;
    }
    link.onload = () => resolve(readPalette());
    link.onerror = reject;
    link.href = url;
  });
}

export function saveThemeToAccount(name) {
  fetch("/api/theme", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ theme: name }),
  }).catch(() => {});
}

export function readPalette() {
  const root = getComputedStyle(document.documentElement);
  const palette = {};
  for (const k of KEYS) {
    palette[k] = root.getPropertyValue(`--${k}`).trim();
  }
  return palette;
}

export function getStoredTheme() {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : DEFAULT_THEME;
}

export function paletteToTheme(p) {
  if (!p) return undefined;
  return {
    background: p.background,
    foreground: p.foreground,
    cursor: p.cursor,
    cursorAccent: p["cursor-text"] || p.background,
    selectionBackground: p["selection-background"],
    selectionForeground: p["selection-foreground"],
    black: p["ansi-0"],
    red: p["ansi-1"],
    green: p["ansi-2"],
    yellow: p["ansi-3"],
    blue: p["ansi-4"],
    magenta: p["ansi-5"],
    cyan: p["ansi-6"],
    white: p["ansi-7"],
    brightBlack: p["ansi-8"],
    brightRed: p["ansi-9"],
    brightGreen: p["ansi-10"],
    brightYellow: p["ansi-11"],
    brightBlue: p["ansi-12"],
    brightMagenta: p["ansi-13"],
    brightCyan: p["ansi-14"],
    brightWhite: p["ansi-15"],
  };
}
