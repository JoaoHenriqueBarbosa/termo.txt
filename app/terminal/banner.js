import { ansi, paint } from "./colors";

const BANNER = [
  "  ________________  __  _______ ",
  " /_  __/ ____/ __ \\/  |/  / __ \\",
  "  / / / __/ / /_/ / /|_/ / / / /",
  " / / / /___/ _, _/ /  / / /_/ / ",
  "/_/ /_____/_/ |_/_/  /_/\\____/  ",
  "                                ",
];

const SUFFIX_LINE = 4;
const SUFFIX = ".txt";

export function writeBanner(write) {
  BANNER.forEach((line, i) => {
    const content = i === SUFFIX_LINE ? line + SUFFIX : line;
    write(paint(ansi.green, content) + "\r\n");
  });
}
