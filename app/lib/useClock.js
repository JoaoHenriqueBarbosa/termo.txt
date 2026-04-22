import { useEffect, useState } from "react";

const formatClock = () => {
  const t = new Date();
  return (
    String(t.getHours()).padStart(2, "0") +
    ":" +
    String(t.getMinutes()).padStart(2, "0")
  );
};

export function useClock() {
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    setClock(formatClock());
    const id = setInterval(() => setClock(formatClock()), 15_000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
