export const readCookie = (name) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];

export const writeCookie = (name, value, maxAge = 31_536_000) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
};
