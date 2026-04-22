import { ansi, paint } from "./colors";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const BOOT_STEPS = [
  "BIOS v0.1.4 — termo.txt",
  "Memory test: 4096K OK",
  "Detecting devices...",
  "Mounting /dev/words",
  "Loading dictionary",
  "Starting termo daemon",
  "Initializing TTY",
];

export async function runBoot({ write, sleep, isFast, isDisposed }) {
  for (const step of BOOT_STEPS) {
    const fullWork = 250 + Math.random() * 900;
    const start = performance.now();
    let i = 0;
    while (true) {
      const work = isFast() ? 30 : fullWork;
      if (performance.now() - start >= work) break;
      const frame = SPINNER[i % SPINNER.length];
      write(`\r${paint(ansi.green, frame)} ${paint(ansi.dim, step)}`);
      await sleep(isFast() ? 8 : 80);
      if (isDisposed()) return;
      i++;
    }
    write(`\r${paint(ansi.green, "✔")} ${paint(ansi.dim, step)}\r\n`);
  }
}
