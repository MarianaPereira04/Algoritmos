"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ErrorBox } from "@/components/ErrorBox";
import { FrameTable, type MemoryStep } from "@/components/FrameTable";
import { Metric } from "@/components/Metric";
import { post } from "@/lib/api";

const classicReferences = "1,2,3,4,1,2,5,1,2,3,4,5";
const algorithms = {
  fifo: {
    title: "FIFO",
    description: "Reemplaza la página que lleva más tiempo cargada en memoria.",
  },
  lru: {
    title: "LRU",
    description: "Reemplaza la página cuyo último uso ocurrió hace más tiempo.",
  },
  optimal: {
    title: "Óptimo",
    description:
      "Reemplaza la página cuyo próximo uso está más lejos; si hay empate, elige el marco de menor índice.",
  },
  clock: {
    title: "Clock",
    description:
      "Un puntero recorre los marcos y da otra oportunidad a las páginas con bit de uso en 1. Un HIT pone su bit en 1 y no mueve el puntero.",
  },
  lfu: {
    title: "LFU",
    description:
      "Reemplaza la página con menos usos; si hay empate, sale la que lleva más tiempo cargada.",
  },
} as const;

type Algorithm = keyof typeof algorithms;
type SimulationResult = {
  steps: MemoryStep[];
  faults: number;
  hits: number;
  faultRate: number;
};

function referencesError(value: string): string | null {
  const values = value.split(",").map((part) => part.trim());
  if (values.length < 1 || values.length > 100 || values.some((part) => part === "")) {
    return "Escribe entre 1 y 100 referencias separadas por comas.";
  }
  if (values.some((part) => !/^\d+$/.test(part))) {
    return "Cada referencia debe ser un entero mayor o igual a 0.";
  }
  return null;
}

function framesError(value: string): string | null {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 10) {
    return "El número de marcos debe ser un entero entre 1 y 10.";
  }
  return null;
}

export default function MemoryAlgorithmPage() {
  const params = useParams<{ algoritmo: string }>();
  const algorithm = params.algoritmo as Algorithm;
  const definition = algorithms[algorithm];
  const [referencesText, setReferencesText] = useState(classicReferences);
  const [framesText, setFramesText] = useState("3");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!definition) {
    return (
      <section className="card-panel space-y-3 border-l-4 border-l-[var(--memoria)]">
        <h1 className="m-0 text-3xl font-bold tracking-tight">Algoritmo no encontrado</h1>
        <Link className="font-semibold text-[var(--memoria)] underline underline-offset-4" href="/">
          Volver al inicio
        </Link>
      </section>
    );
  }

  const currentReferencesError = referencesError(referencesText);
  const currentFramesError = framesError(framesText);

  const chooseExample = (frames: number) => {
    setReferencesText(classicReferences);
    setFramesText(String(frames));
    setError(null);
    setResult(null);
  };

  const execute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentReferencesError || currentFramesError) return;
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const response = await post<SimulationResult>(`/memory/${algorithm}`, {
        references: referencesText.split(",").map((part) => Number(part.trim())),
        frames: Number(framesText),
      });
      setResult(response);
      setCurrentStep(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-l-4 border-l-[var(--memoria)] pl-5">
        <p className="eyebrow !text-[var(--memoria)]">Memoria · Reemplazo de páginas</p>
        <h1 className="text-4xl font-bold tracking-tight text-[#14171f]">{definition.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-[#646873]">
          <strong className="text-[#14171f]">Cómo funciona: </strong>
          {definition.description}
        </p>
      </header>

      <form className="card-panel space-y-5" onSubmit={execute}>
        <div>
          <p className="eyebrow !text-[var(--memoria)]">Configuración</p>
          <h2 className="mb-0 text-xl font-bold tracking-tight">Cadena de referencias</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem]">
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#646873]">Referencias</span>
            <input
              aria-describedby={currentReferencesError ? "references-error" : undefined}
              aria-invalid={Boolean(currentReferencesError)}
              className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2.5 font-mono text-sm text-[#14171f] outline-none focus:border-[var(--memoria)] focus:ring-2 focus:ring-[var(--memoria)]/15"
              inputMode="numeric"
              type="text"
              value={referencesText}
              onChange={(event) => {
                setReferencesText(event.target.value);
                setResult(null);
              }}
              placeholder="Ej.: 1, 2, 3, 4"
            />
            {currentReferencesError && (
              <span className="mt-1 block text-sm text-[#b53924]" id="references-error">
                {currentReferencesError}
              </span>
            )}
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-[#646873]">Marcos (1–10)</span>
            <input
              aria-describedby={currentFramesError ? "frames-error" : undefined}
              aria-invalid={Boolean(currentFramesError)}
              className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2.5 font-mono text-sm text-[#14171f] outline-none focus:border-[var(--memoria)] focus:ring-2 focus:ring-[var(--memoria)]/15"
              type="number"
              min="1"
              max="10"
              step="1"
              value={framesText}
              onChange={(event) => {
                setFramesText(event.target.value);
                setResult(null);
              }}
            />
            {currentFramesError && (
              <span className="mt-1 block text-sm text-[#b53924]" id="frames-error">
                {currentFramesError}
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-[#c5dedc] bg-[#eff7f6] px-3.5 py-2 text-sm font-semibold text-[var(--memoria)] transition hover:bg-[#e2f0ee]"
            type="button"
            onClick={() => chooseExample(3)}
          >
            Cadena clásica (3 marcos)
          </button>
          <button
            className="rounded-lg border border-[#c5dedc] bg-[#eff7f6] px-3.5 py-2 text-sm font-semibold text-[var(--memoria)] transition hover:bg-[#e2f0ee]"
            type="button"
            onClick={() => chooseExample(4)}
          >
            Belady (4 marcos)
          </button>
        </div>

        <div className="flex justify-end">
          <button
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--memoria)" }}
            type="submit"
            disabled={submitting || Boolean(currentReferencesError || currentFramesError)}
          >
            {submitting ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {result && (
        <section className="space-y-5" aria-live="polite">
          <div>
            <p className="eyebrow !text-[var(--memoria)]">Simulación</p>
            <h2 className="text-2xl font-bold tracking-tight text-[#14171f]">Estado de los marcos</h2>
          </div>

          <FrameTable
            algorithm={algorithm}
            steps={result.steps}
            index={currentStep}
            onChange={setCurrentStep}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-panel"><Metric label="Fallos" value={result.faults} /></div>
            <div className="card-panel"><Metric label="Aciertos" value={result.hits} /></div>
            <div className="card-panel">
              <Metric label="Tasa de fallos" value={`${(result.faultRate * 100).toFixed(1)}%`} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
