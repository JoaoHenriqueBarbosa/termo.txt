import { paletteToTheme } from "../lib/themes";

const FONT_FAMILY =
  "'JetBrainsMono Nerd Font', 'JetBrains Mono', ui-monospace, monospace";

const FALLBACK_THEME = {
  background: "#060807",
  foreground: "#cfe8d8",
  cursor: "#3dfc87",
};

export async function createTerminals({ scrollbackEl, inputEl, palette }) {
  const { Terminal } = await import("@xterm/xterm");
  const { FitAddon } = await import("@xterm/addon-fit");
  const { WebFontsAddon } = await import("@xterm/addon-web-fonts");

  scrollbackEl.innerHTML = "";
  inputEl.innerHTML = "";

  const baseOpts = {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    theme: paletteToTheme(palette) ?? FALLBACK_THEME,
    allowProposedApi: true,
  };

  const scrollback = new Terminal({
    ...baseOpts,
    cursorBlink: false,
    scrollback: 5000,
    disableStdin: true,
    cursorStyle: "underline",
    cursorInactiveStyle: "none",
  });
  const input = new Terminal({
    ...baseOpts,
    cursorBlink: true,
    scrollback: 0,
    rows: 1,
  });

  const fitScrollback = new FitAddon();
  const fitInput = new FitAddon();
  scrollback.loadAddon(fitScrollback);
  input.loadAddon(fitInput);

  const webFonts = new WebFontsAddon();
  scrollback.loadAddon(webFonts);
  await webFonts.loadFonts(["JetBrainsMono Nerd Font"]);

  scrollback.open(scrollbackEl);
  input.open(inputEl);
  fitScrollback.fit();
  fitInput.fit();

  const scrollbackTextarea = scrollback.element?.querySelector("textarea");
  if (scrollbackTextarea) {
    scrollbackTextarea.tabIndex = -1;
    scrollbackTextarea.setAttribute("aria-hidden", "true");
  }

  const onResize = () => {
    fitScrollback.fit();
    fitInput.fit();
  };
  window.addEventListener("resize", onResize);

  const inputTextarea = input.textarea;
  const hasDialog = () => !!document.querySelector('[role="dialog"]');

  const focusInput = () => {
    if (hasDialog()) return;
    if (inputTextarea && document.body.contains(inputTextarea)) {
      inputTextarea.focus();
    }
  };
  const onBlur = () => setTimeout(focusInput, 0);
  inputTextarea?.addEventListener("blur", onBlur);

  const onRefocusEvent = () => setTimeout(focusInput, 0);
  window.addEventListener("termo:refocus", onRefocusEvent);

  const teardown = () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("termo:refocus", onRefocusEvent);
    inputTextarea?.removeEventListener("blur", onBlur);
    scrollback.dispose();
    input.dispose();
    scrollbackEl.innerHTML = "";
    inputEl.innerHTML = "";
  };

  return { scrollback, input, focusInput, teardown };
}
