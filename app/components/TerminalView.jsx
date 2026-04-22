"use client";

import { useEffect, useRef, useState } from "react";
import "@xterm/xterm/css/xterm.css";
import Titlebar from "./Titlebar";
import Powerline from "./Powerline";
import Config from "./Config";
import Themes from "./Themes";
import { ansi, paint } from "../terminal/colors";
import { createTerminals } from "../terminal/setup";
import { createPacing } from "../terminal/pacing";
import { createStreamer } from "../terminal/stream";
import { createInputController } from "../terminal/inputController";
import { runBoot } from "../terminal/boot";
import { writeBanner } from "../terminal/banner";
import { buildOnboarding, runOnboarding } from "../terminal/onboarding";
import { runRepl } from "../terminal/repl";
import { readCookie, writeCookie } from "../lib/cookies";
import { loadTheme, getStoredTheme, paletteToTheme } from "../lib/themes";

export default function TerminalView({ initialUser }) {
  const scrollbackRef = useRef(null);
  const inputRef = useRef(null);
  const [userName, setUserName] = useState(initialUser?.name ?? "");
  const [configOpen, setConfigOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);

  useEffect(() => {
    const onConfig = (e) => setConfigOpen(!!e.detail?.open);
    const onThemes = (e) => setThemesOpen(!!e.detail?.open);
    window.addEventListener("termo:config", onConfig);
    window.addEventListener("termo:themes", onThemes);
    return () => {
      window.removeEventListener("termo:config", onConfig);
      window.removeEventListener("termo:themes", onThemes);
    };
  }, []);

  useEffect(() => {
    let teardown = () => {};
    let disposed = false;

    (async () => {
      const palette = await loadTheme(getStoredTheme()).catch(() => null);

      const terms = await createTerminals({
        scrollbackEl: scrollbackRef.current,
        inputEl: inputRef.current,
        palette,
      });
      if (disposed) return terms.teardown();

      const { scrollback, input, focusInput } = terms;

      const onThemeChange = (e) => {
        const p = e.detail?.palette;
        if (!p) return;
        const t = paletteToTheme(p);
        scrollback.options.theme = t;
        input.options.theme = t;
      };
      window.addEventListener("termo:theme", onThemeChange);

      const pacing = createPacing(readCookie("pace") === "fast");
      const onSkipKey = (e) => {
        if (e.key === "Escape") {
          pacing.setFast(true);
          writeCookie("pace", "fast");
        }
      };
      window.addEventListener("keydown", onSkipKey, true);

      const streamTokens = createStreamer({
        write: (s) => scrollback.write(s),
        sleep: pacing.sleep,
        isCancelled: () => disposed,
      });

      const inputController = createInputController({ input });

      teardown = () => {
        window.removeEventListener("keydown", onSkipKey, true);
        window.removeEventListener("termo:theme", onThemeChange);
        terms.teardown();
      };

      focusInput();
      scrollback.writeln(paint(ansi.dim, "Press ESC to go fast"));
      scrollback.writeln("");

      await runBoot({
        write: (s) => scrollback.write(s),
        sleep: pacing.sleep,
        isFast: pacing.isFast,
        isDisposed: () => disposed,
      });
      if (disposed) return;

      await pacing.sleep(250);
      scrollback.writeln("");
      writeBanner((s) => scrollback.write(s));

      const state = {
        userName: initialUser?.name ?? "",
        userAge: initialUser?.age ? String(initialUser.age) : "",
        userPassword: "",
        user: initialUser ?? null,
        onChange: () => setUserName(state.userName),
      };

      if (initialUser) {
        scrollback.writeln("");
        await streamTokens(
          paint(ansi.fg, `Bem-vindo de volta, ${initialUser.name}.`),
        );
      } else {
        const steps = buildOnboarding(state);
        await runOnboarding({
          steps,
          startStep: "hasAccount",
          state,
          scrollback,
          setMode: inputController.setMode,
          writeInputPrompt: inputController.writePrompt,
          clearInput: inputController.clear,
          streamTokens,
          readNext: inputController.readNext,
        });
        if (disposed) return;
        state.onChange();
      }

      scrollback.writeln("");
      runRepl({ scrollback, inputController, state });
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, [initialUser]);

  return (
    <main className="app">
      <Titlebar />
      <div className="terminal-stack">
        <div ref={scrollbackRef} className="terminal-scrollback" />
        <div className="terminal-divider" />
        <Powerline user={userName} />
        <div ref={inputRef} className="terminal-input" />
        <div className="terminal-divider" />
      </div>
      <Config open={configOpen} onClose={() => setConfigOpen(false)} />
      <Themes open={themesOpen} onClose={() => setThemesOpen(false)} />
    </main>
  );
}
