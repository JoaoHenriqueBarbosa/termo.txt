"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";
import { fetchThemeList, loadTheme, getStoredTheme } from "../lib/themes";

export default function Themes({ open, onClose }) {
  const bodyRef = useRef(null);
  const [themes, setThemes] = useState([]);
  const [cursor, setCursor] = useState(-1);
  const prevTheme = useRef(null);

  const cancel = () => {
    applyTheme(prevTheme.current);
    setCursor(-1);
    onClose();
  };

  const confirm = () => {
    setCursor(-1);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    prevTheme.current = getStoredTheme();
    if (!themes.length) {
      fetchThemeList().then((list) => {
        setThemes(list);
        setCursor(list.indexOf(prevTheme.current));
      });
    } else {
      setCursor(themes.indexOf(prevTheme.current));
    }
  }, [open, themes.length]);

  useEffect(() => {
    if (!open || !themes.length || cursor < 0) return;
    const el = bodyRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
    applyTheme(themes[cursor]);
  }, [cursor, open, themes]);

  const applyTheme = async (name) => {
    const palette = await loadTheme(name);
    window.dispatchEvent(
      new CustomEvent("termo:theme", { detail: { name, palette } }),
    );
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      confirm();
      return;
    }
    if (!themes.length) return;
    const max = themes.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(max, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setCursor((c) => Math.min(max, c + 10));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 10));
    } else if (e.key === "Home") {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setCursor(max);
    }
  };

  return (
    <Dialog open={open} onClose={cancel} title="THEMES" subtitle={themes.length} className="dialog-themes" onKeyDown={handleKey}>
      <div className="themes-body" ref={bodyRef}>
        {themes.map((name, i) => (
          <div
            key={name}
            data-idx={i}
            className={"themes-row" + (i === cursor ? " is-active" : "")}
            onClick={() => setCursor(i)}
            onDoubleClick={confirm}
          >
            <span className="themes-name">{name}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
