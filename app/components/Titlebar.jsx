"use client";

import { useClock } from "../lib/useClock";

function todayKey() {
  const t = new Date();
  return (
    t.getFullYear() +
    "-" +
    String(t.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(t.getDate()).padStart(2, "0")
  );
}

export default function Titlebar() {
  const clock = useClock();

  return (
    <div className="titlebar">
      <div>
        <span className="dot" />
        TERMO.TXT <span style={{ color: "var(--dim)" }}>v0.1.4</span>
      </div>
      <div className="right">
        <span>{todayKey()}</span>
        <span>{clock}</span>
      </div>
    </div>
  );
}
