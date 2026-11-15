"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DiskTrack, type DiskStep } from "@/components/DiskTrack";
import { ErrorBox } from "@/components/ErrorBox";
import { Metric } from "@/components/Metric";
import { post } from "@/lib/api";

const classicRequests = "98,183,37,122,14,124,65,67";
const algorithms = {
  fcfs: {
    title: "FCFS",
    description: "Atiende las solicitudes en el mismo orden en que llegaron.",
  },
  sstf: {
    title: "SSTF",
    description: "Elige la solicitud más cercana a la posición actual del cabezal; en caso de empate, toma la primera de la lista.",
  },
  scan: {
    title: "SCAN",
    description: "El cabezal avanza en la dirección elegida hasta el borde del disco antes de invertir el sentido.",
  },
  cscan: {
    title: "C-SCAN",
    description: "Atiende en una sola dirección; al llegar al extremo, salta al otro lado del disco y ese salto también cuenta como movimiento.",
  },
} as const;

type Algorithm = keyof typeof algorithms;
type Direction = "up" | "down";
type DiskResult = { steps: DiskStep[]; total: number; order: number[] };

function parseRequests(value: string): number[] | null {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length < 1 || parts.length > 50 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }
  const requests = parts.map(Number);
  return requests.every(Number.isSafeInteger) ? requests : null;
}

function requestsError(value: string, maxCylinder: number | null): string | null {
  const requests = parseRequests(value);
  if (!requests) return "Escribe entre 1 y 50 solicitudes enteras, separadas por comas.";
  if (maxCylinder === null) return "Define primero un cilindro máximo válido.";
  if (requests.some((request) => request < 0 || request > maxCylinder)) {
    return `Cada solicitud debe estar entre 0 y ${maxCylinder}.`;
  }
  return null;
}

function validMax(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const max = Number(value);
  return Number.isSafeInteger(max) && max >= 1 && max <= 999 ? max : null;
}

export default function DiskAlgorithmPage() {
  const params = useParams<{ algoritmo: string }>();
  const algorithm = params.algoritmo as Algorithm;
  const definition = algorithms[algorithm];
  const [requestsText, setRequestsText] = useState(classicRequests);
  const [headText, setHeadText] = useState("53");
  const [maxText, setMaxText] = useState("199");
  const [direction, setDirection] = useState<Direction>("up");
  const [result, setResult] = useState<DiskResult | null>(null);
  const [stale, setStale] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!definition) {
    return (
      <section className="card-panel space-y-3 border-l-4 border-l-[var(--disco)]">
        <h1 className="m-0 text-3xl font-bold tracking-tight">Algoritmo no encontrado</h1>
        <Link className="font-semibold text-[#8a5a00] underline underline-offset-4" href="/">
          Volver al inicio
        </Link>
      </section>
    );
  }

  const maxCylinder = validMax(maxText);
  const parsed = parseRequests(requestsText);
  const requestValidation = requestsError(requestsText, maxCylinder);
  const headValue = /^\d+$/.test(headText) ? Number(headText) : Number.NaN;
  const headValidation =
    maxCylinder === null
      ? "Define un cilindro máximo válido."
      : !Number.isSafeInteger(headValue) || headValue < 0 || headValue > maxCylinder
        ? `El cabezal debe ser un entero entre 0 y ${maxCylinder}.`
        : null;
  const maxValidation = maxCylinder === null ? "El máximo debe ser un entero entre 1 y 999." : null;
  const invalid = Boolean(requestValidation || headValidation || maxValidation);

  const clearResult = () => {
    setStale(result !== null);
    setError(null);
  };

  const chooseExample = () => {
    setRequestsText(classicRequests);
    setHeadText("53");
    clearResult();
  };

  const execute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (invalid || !parsed || maxCylinder === null) return;
    setError(null);
    setResult(null);
    setStale(false);
    setSubmitting(true);
    try {
      const response = await post<DiskResult>(`/disk/${algorithm}`, {
        requests: parsed,
        head: headValue,
        maxCylinder,
        direction,
      });
      setResult(response);
      setStale(false);
      setRequestCount(parsed.length);
      setCurrentStep(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-l-4 border-l-[var(--disco)] pl-5">
        <p className="eyebrow !text-[#8a5a00]">Disco · Planificación de solicitudes</p>
        <h1 className="text-4xl font-bold tracking-tight text-[#14171f]">{definition.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-[#646873]">
          <strong className="text-[#14171f]">Cómo funciona: </strong>
          {definition.description}
        </p>
      </header>

      <form className="card-panel space-y-5" onSubmit={execute}>
        <div>
          <p className="eyebrow !text-[#8a5a00]">Configuración</p>
          <h2 className="mb-0 text-xl font-bold tracking-tight">Solicitudes del disco</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem_10rem]">
          <label>
            <span className="mb-1 block text-xs font-semibold text-[#646873]">Solicitudes</span>
            <input
              aria-describedby={requestValidation ? "requests-error" : undefined}
              aria-invalid={Boolean(requestValidation)}
              className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2.5 font-mono text-sm text-[#14171f] outline-none focus:border-[var(--disco)] focus:ring-2 focus:ring-[#8a5a00]/15"
              inputMode="numeric"
              type="text"
              value={requestsText}
              onChange={(event) => {
                setRequestsText(event.target.value);
                clearResult();
              }}
              placeholder="Ej.: 98, 183, 37"
            />
            {requestValidation && <span className="mt-1 block text-sm text-[#b53924]" id="requests-error">{requestValidation}</span>}
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-[#646873]">Cabezal inicial</span>
            <input
              aria-describedby={headValidation ? "head-error" : undefined}
              aria-invalid={Boolean(headValidation)}
              className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2.5 font-mono text-sm text-[#14171f] outline-none focus:border-[var(--disco)] focus:ring-2 focus:ring-[#8a5a00]/15"
              type="number"
              min="0"
              max={maxCylinder ?? undefined}
              step="1"
              value={headText}
              onChange={(event) => {
                setHeadText(event.target.value);
                clearResult();
              }}
            />
            {headValidation && <span className="mt-1 block text-sm text-[#b53924]" id="head-error">{headValidation}</span>}
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-[#646873]">Cilindro máximo</span>
            <input
              aria-describedby={maxValidation ? "max-error" : undefined}
              aria-invalid={Boolean(maxValidation)}
              className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2.5 font-mono text-sm text-[#14171f] outline-none focus:border-[var(--disco)] focus:ring-2 focus:ring-[#8a5a00]/15"
              type="number"
              min="1"
              max="999"
              step="1"
              value={maxText}
              onChange={(event) => {
                setMaxText(event.target.value);
                clearResult();
              }}
            />
            {maxValidation && <span className="mt-1 block text-sm text-[#b53924]" id="max-error">{maxValidation}</span>}
          </label>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-[#e8d9b6] bg-[#fcf6e9] px-3.5 py-2 text-sm font-semibold text-[#8a5a00] transition hover:bg-[#f7edda]"
              type="button"
              onClick={chooseExample}
            >
              Disco clásico
            </button>
            {(algorithm === "scan" || algorithm === "cscan") && (
              <label className="min-w-40">
                <span className="mb-1 block text-xs font-semibold text-[#646873]">Dirección</span>
                <select
                  className="w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2 text-sm text-[#14171f] outline-none focus:border-[#8a5a00] focus:ring-2 focus:ring-[#8a5a00]/15"
                  value={direction}
                  onChange={(event) => {
                    setDirection(event.target.value as Direction);
                    clearResult();
                  }}
                >
                  <option value="up">Subiendo</option>
                  <option value="down">Bajando</option>
                </select>
              </label>
            )}
          </div>
          <button
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#8a5a00" }}
            type="submit"
            disabled={submitting || invalid}
          >
            {submitting ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {result && (
        <section className="space-y-5" aria-live="polite">
          <div>
            <p className="eyebrow !text-[#8a5a00]">Simulación</p>
            <h2 className="text-2xl font-bold tracking-tight text-[#14171f]">Recorrido del cabezal</h2>
            {stale && (
              <p className="mt-2 text-sm font-medium text-[#8a5a00]" role="status">
                Resultado desactualizado, vuelve a ejecutar
              </p>
            )}
          </div>

          <DiskTrack
            steps={result.steps}
            requests={parsed ?? []}
            head={headValue}
            maxCylinder={maxCylinder ?? 199}
            index={currentStep}
            onChange={setCurrentStep}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-panel"><Metric label="Movimiento total" value={result.total} /></div>
            <div className="card-panel">
              <Metric label="Promedio por solicitud" value={requestCount ? (result.total / requestCount).toFixed(1) : "—"} />
            </div>
          </div>

          <div className="card-panel space-y-4">
            <div>
              <p className="eyebrow !text-[#8a5a00]">Detalle</p>
              <h3 className="mb-0 text-lg font-bold">Movimientos</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e7e1d6]">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead className="bg-[#f8f5ee] text-xs uppercase tracking-wider text-[#646873]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Paso</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold">Destino</th>
                    <th className="px-4 py-3 font-semibold">Distancia</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step, stepIndex) => (
                    <tr
                      className={`border-t border-[#e7e1d6] ${stepIndex === currentStep ? "bg-[#fcf6e9]" : ""}`}
                      key={`${stepIndex}-${step.kind}-${step.from}-${step.to}`}
                    >
                      <td className="px-4 py-3 font-mono tabular-nums">{stepIndex + 1}</td>
                      <td className="px-4 py-3">{step.kind === "service" ? "Atención" : step.kind === "boundary" ? "Extremo" : "Salto"}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{step.from}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{step.to}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{step.distance}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#ded8cd] bg-[#fbf9f4] font-bold">
                    <td className="px-4 py-3" colSpan={4}>Total</td>
                    <td className="px-4 py-3 font-mono tabular-nums">{result.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {result.steps[currentStep] && (
            <div className="card-panel border-l-4 border-l-[var(--disco)]">
              <p className="eyebrow !text-[#8a5a00]">Paso {currentStep + 1}</p>
              <p className="m-0 text-sm leading-6 text-[#3c414a]">{result.steps[currentStep].note}</p>
            </div>
          )}

          <div className="card-panel space-y-3">
            <div>
              <p className="eyebrow !text-[#8a5a00]">Orden de atención</p>
              <h3 className="mb-0 text-lg font-bold">Solicitudes atendidas</h3>
            </div>
            <ol className="m-0 flex flex-wrap gap-2 p-0" aria-label="Orden de atención">
              {result.order.map((cylinder, index) => (
                <li className="list-none rounded-full bg-[#fcf3df] px-3 py-1.5 font-mono text-sm font-semibold text-[#8a5a00]" key={`${index}-${cylinder}`}>
                  {cylinder}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
