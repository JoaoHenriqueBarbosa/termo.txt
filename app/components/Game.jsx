"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { normalize, evaluate } from "../lib/game";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function celebrate() {
  // Confetti
  const end = Date.now() + 2500;
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ["#538d4e", "#6aaa64", "#b59f3b", "#c9b458", "#ffffff"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ["#538d4e", "#6aaa64", "#b59f3b", "#c9b458", "#ffffff"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  // Sound
  const win = new Audio("/sounds/win.mp3");
  const crowd = new Audio("/sounds/crowd.mp3");
  win.volume = 0.8;
  crowd.volume = 0.6;
  win.play().catch(() => {});
  crowd.play().catch(() => {});

  // Fade out crowd after win (3s)
  setTimeout(() => {
    const fadeMs = 1500;
    const steps = 30;
    const interval = fadeMs / steps;
    const startVol = crowd.volume;
    let step = 0;
    const fade = setInterval(() => {
      step++;
      crowd.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(fade);
        crowd.pause();
      }
    }, interval);
  }, 3000);
}

export default function Game({ open, onClose }) {
  const [answer, setAnswer] = useState(null);
  const [valid, setValid] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState(null);
  const answerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setMessage(null);

    fetch("/api/word")
      .then((r) => r.json())
      .then((d) => {
        setAnswer(d.word);
        answerRef.current = d.word;
      });

    if (!valid) {
      fetch("/words.json")
        .then((r) => r.json())
        .then((d) => {
          const set = new Set([...d.answers, ...d.valid].map(normalize));
          setValid(set);
        });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onGuess = (e) => {
      const raw = e.detail?.word;
      if (!raw || gameOver) return;

      const word = raw.toLowerCase();
      if ([...normalize(word)].length !== WORD_LENGTH) {
        setMessage({ text: "palavra deve ter 5 letras", type: "error" });
        return;
      }

      if (valid && !valid.has(normalize(word))) {
        setMessage({ text: "palavra não encontrada", type: "error" });
        return;
      }

      setMessage(null);
      const result = evaluate(word, answerRef.current);
      const guess = { word, result };

      setGuesses((prev) => {
        const next = [...prev, guess];
        const isCorrect = result.every((r) => r === "correct");
        if (isCorrect) {
          setWon(true);
          setGameOver(true);
          setMessage({ text: `acertou em ${next.length}/${MAX_GUESSES} \u2014 /exit`, type: "win" });
          celebrate();
        } else if (next.length >= MAX_GUESSES) {
          setGameOver(true);
          setMessage({ text: `a palavra era: ${answerRef.current} \u2014 /exit`, type: "lose" });
        }
        return next;
      });
    };

    const onGameError = (e) => {
      setMessage({ text: e.detail?.text, type: "error" });
    };

    window.addEventListener("termo:guess", onGuess);
    window.addEventListener("termo:game-error", onGameError);
    return () => {
      window.removeEventListener("termo:guess", onGuess);
      window.removeEventListener("termo:game-error", onGameError);
    };
  }, [open, gameOver, valid]);

  if (!open || !answer) return null;

  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    const guess = guesses[i];
    const cells = [];
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (guess) {
        cells.push(
          <div key={j} className={`game-cell ${guess.result[j]}`}>
            {guess.word[j]}
          </div>,
        );
      } else {
        cells.push(<div key={j} className="game-cell empty" />);
      }
    }
    rows.push(
      <div key={i} className="game-row">
        {cells}
      </div>,
    );
  }

  return (
    <div className="game">
      <div className="game-grid">{rows}</div>
      <div className="game-status">
        {message ? (
          <span className={`game-${message.type}`}>{message.text}</span>
        ) : (
          "\u00a0"
        )}
      </div>
    </div>
  );
}
