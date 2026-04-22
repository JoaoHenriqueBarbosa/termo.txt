"use client";

import { useClock } from "../lib/useClock";

const LEFT_SEGMENTS = [
  { bg: "var(--ok-dim)", fg: "var(--fg-bright)" },
  { bg: "var(--line)", fg: "var(--fg)" },
  { bg: "var(--bg-soft)", fg: "var(--muted)" },
];

const RIGHT_SEGMENTS = [
  { bg: "var(--line)", fg: "var(--fg)" },
];

const PAGE_BG = "var(--bg)";

export default function Powerline({ user }) {
  const clock = useClock();

  const leftLabels = [user || "guest", "termo", "~"];
  const rightLabels = [clock];

  return (
    <div className="powerline">
      <div className="powerline-side">
        {LEFT_SEGMENTS.map((seg, i) => {
          const next = LEFT_SEGMENTS[i + 1]?.bg ?? PAGE_BG;
          return (
            <span key={i} className="powerline-row">
              <span
                className="powerline-text"
                style={{ background: seg.bg, color: seg.fg }}
              >
                {leftLabels[i]}
              </span>
              <span
                className="powerline-arrow"
                style={{ background: next, color: seg.bg }}
              />
            </span>
          );
        })}
      </div>
      <div className="powerline-spacer" />
      <div className="powerline-side">
        {RIGHT_SEGMENTS.map((seg, i) => {
          const prev = RIGHT_SEGMENTS[i - 1]?.bg ?? PAGE_BG;
          return (
            <span key={i} className="powerline-row">
              <span
                className="powerline-arrow powerline-arrow-left"
                style={{ background: prev, color: seg.bg }}
              />
              <span
                className="powerline-text"
                style={{ background: seg.bg, color: seg.fg }}
              >
                {rightLabels[i]}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
