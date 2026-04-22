"use client";

import { useEffect, useRef } from "react";

export default function Dialog({ open, onClose, title, subtitle, className, onKeyDown, children }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  const onKeyDownRef = useRef(onKeyDown);

  onCloseRef.current = onClose;
  onKeyDownRef.current = onKeyDown;

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      onKeyDownRef.current?.(e);
    };

    const trapMouseDown = (e) => {
      if (ref.current?.contains(e.target)) return;
      e.preventDefault();
      ref.current?.focus();
    };

    const trapFocus = (e) => {
      if (ref.current?.contains(e.target)) return;
      ref.current?.focus();
    };

    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", trapMouseDown, true);
    document.addEventListener("focusin", trapFocus, true);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", trapMouseDown, true);
      document.removeEventListener("focusin", trapFocus, true);
      window.dispatchEvent(new CustomEvent("termo:refocus"));
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={"dialog" + (className ? " " + className : "")}
      role="dialog"
      aria-label={title.toLowerCase()}
      tabIndex={-1}
    >
      <div className="dialog-header">
        <span>
          <b>::</b>{title}{subtitle != null ? ` \u00b7 ${subtitle}` : ""}
        </span>
        <span className="dialog-close" onClick={() => onCloseRef.current()}>
          [esc]
        </span>
      </div>
      {children}
    </div>
  );
}
