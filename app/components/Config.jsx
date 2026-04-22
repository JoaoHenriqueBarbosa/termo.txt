"use client";

import { useEffect, useState } from "react";
import Dialog from "./Dialog";
import { fetchThemeList, loadTheme, getStoredTheme } from "../lib/themes";

export default function Config({ open, onClose }) {
  const [themes, setThemes] = useState([]);
  const [current, setCurrent] = useState(() => getStoredTheme());

  useEffect(() => {
    if (!open || themes.length) return;
    fetchThemeList().then(setThemes).catch(() => {});
  }, [open, themes.length]);

  const onChangeTheme = async (e) => {
    const name = e.target.value;
    setCurrent(name);
    const palette = await loadTheme(name);
    window.dispatchEvent(
      new CustomEvent("termo:theme", { detail: { name, palette } }),
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="CONFIG">
      <div className="dialog-body">
        <label className="config-row">
          <span className="config-label">theme</span>
          <select
            className="config-select"
            value={current}
            onChange={onChangeTheme}
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Dialog>
  );
}
