"use client";

import { useEffect, useRef, useState } from "react";
import { normalize, evaluate } from "../lib/game";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export default function Game({ open, onClose }) {
  const [answer, setAnswer] = useState(null);
  const [valid, setValid] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [error, setError] = useState(null);
  const answerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setError(null);

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
        setError("palavra deve ter 5 letras");
        return;
      }

      if (valid && !valid.has(normalize(word))) {
        setError("palavra não encontrada");
        return;
      }

      setError(null);
      const result = evaluate(word, answerRef.current);
      const guess = { word, result };

      setGuesses((prev) => {
        const next = [...prev, guess];
        const isCorrect = result.every((r) => r === "correct");
        if (isCorrect) {
          setWon(true);
          setGameOver(true);
        } else if (next.length >= MAX_GUESSES) {
          setGameOver(true);
        }
        return next;
      });
    };

    const onKey = (e) => {
      if (e.key === "Escape" || (gameOver && e.key === "Enter")) {
        onClose();
      }
    };

    window.addEventListener("termo:guess", onGuess);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("termo:guess", onGuess);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, gameOver, valid, onClose]);

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
      {error && <div className="game-error">{error}</div>}
      {gameOver && (
        <div className="game-message">
          {won
            ? `acertou em ${guesses.length}/${MAX_GUESSES}`
            : `a palavra era: ${answer}`}
          <span className="game-hint"> [enter/esc]</span>
        </div>
      )}
    </div>
  );
}
