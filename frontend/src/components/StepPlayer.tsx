"use client";

import { useEffect, useState } from "react";

type StepPlayerProps = {
  total: number;
  index: number;
  onChange: (index: number) => void;
};

export function StepPlayer({ total, index, onChange }: StepPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const lastIndex = Math.max(0, total - 1);
  const isPlaying = playing && index < lastIndex;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      const nextIndex = index + 1;
      onChange(nextIndex);
      if (nextIndex >= lastIndex) setPlaying(false);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [index, isPlaying, lastIndex, onChange]);

  const changeTo = (nextIndex: number) => {
    setPlaying(false);
    onChange(Math.min(lastIndex, Math.max(0, nextIndex)));
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    if (total === 0 || index >= lastIndex) return;
    setPlaying(true);
  };

  return (
    <div className="step-player" aria-label="Controles de pasos">
      <button type="button" onClick={() => changeTo(index - 1)} disabled={total === 0 || index <= 0}>
        Anterior
      </button>
      <button
        type="button"
        onClick={togglePlayback}
        disabled={total === 0 || index >= lastIndex}
      >
        {isPlaying ? "Pausar" : "Reproducir"}
      </button>
      <button type="button" onClick={() => changeTo(index + 1)} disabled={total === 0 || index >= lastIndex}>
        Siguiente
      </button>
      <button type="button" onClick={() => changeTo(0)} disabled={total === 0 || (index === 0 && !isPlaying)}>
        Reiniciar
      </button>
      <span className="step-count" aria-live="polite">
        Paso {total === 0 ? 0 : index + 1} de {total}
      </span>
    </div>
  );
}
