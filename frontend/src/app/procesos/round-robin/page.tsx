"use client";

import { useState, type FormEvent } from "react";
import { ErrorBox } from "@/components/ErrorBox";
import { Gantt } from "@/components/Gantt";
import { Metric } from "@/components/Metric";
import { post } from "@/lib/api";

type ProcessInput = { id: string; arrival: string; burst: string };
type TimelineEntry = {
  type: "run" | "idle";
  pid?: string;
  start: number;
  end: number;
  queue: string[];
  note: string;
};
type ProcessResult = {
  id: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number;
  waiting: number;
};
type SimulationResult = {
  timeline: TimelineEntry[];
  processes: ProcessResult[];
  averages: { turnaround: number; waiting: number };
};

const initialProcesses: ProcessInput[] = [
  { id: "P1", arrival: "0", burst: "5" },
  { id: "P2", arrival: "1", burst: "3" },
  { id: "P3", arrival: "2", burst: "1" },
];
const inputClass =
  "w-full rounded-lg border border-[#ded8cd] bg-white px-3 py-2 text-sm text-[#14171f] outline-none transition focus:border-[var(--proceso)] focus:ring-2 focus:ring-[var(--proceso)]/15";
const labelClass = "mb-1 block text-xs font-semibold text-[#646873]";

export default function RoundRobinPage() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [quantum, setQuantum] = useState("2");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateProcess = (index: number, field: keyof ProcessInput, value: string) => {
    setProcesses((current) =>
      current.map((process, processIndex) =>
        processIndex === index ? { ...process, [field]: value } : process,
      ),
    );
  };

  const addProcess = () => {
    if (processes.length >= 10) return;
    const usedIds = new Set(processes.map((process) => process.id.trim()));
    let suffix = 1;
    while (usedIds.has(`P${suffix}`)) suffix += 1;
    setProcesses((current) => [...current, { id: `P${suffix}`, arrival: "0", burst: "1" }]);
  };

  const removeProcess = (index: number) => {
    if (processes.length <= 1) return;
    setProcesses((current) => current.filter((_, processIndex) => processIndex !== index));
  };

  const execute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const response = await post<SimulationResult>("/processes/round-robin", {
        processes: processes.map((process) => ({
          id: process.id,
          arrival: Number(process.arrival),
          burst: Number(process.burst),
        })),
        quantum: Number(quantum),
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
      <header className="space-y-2">
        <p className="eyebrow">Procesos · Planificación de CPU</p>
        <h1 className="text-4xl font-bold tracking-tight text-[#14171f]">Round Robin</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#646873]">
          Define procesos y un quantum para observar cómo se distribuyen los turnos de CPU.
        </p>
      </header>

      <form className="card-panel space-y-5" onSubmit={execute}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Configuración</p>
            <h2 className="mb-0 text-xl font-bold tracking-tight">Procesos de entrada</h2>
          </div>
          <label className="w-32">
            <span className={labelClass}>Quantum</span>
            <input
              className={inputClass}
              type="number"
              min="1"
              step="1"
              required
              value={quantum}
              onChange={(event) => setQuantum(event.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#e7e1d6]">
          <table className="w-full min-w-[580px] border-collapse text-left text-sm">
            <thead className="bg-[#f8f5ee] text-xs uppercase tracking-wider text-[#646873]">
              <tr>
                <th className="px-4 py-3 font-semibold">Proceso</th>
                <th className="px-4 py-3 font-semibold">Llegada</th>
                <th className="px-4 py-3 font-semibold">Ráfaga</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e1d6]">
              {processes.map((process, index) => (
                <tr key={`${index}-${process.id}`}>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`ID del proceso ${index + 1}`}
                      className={inputClass}
                      type="text"
                      required
                      value={process.id}
                      onChange={(event) => updateProcess(index, "id", event.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`Llegada del proceso ${process.id || index + 1}`}
                      className={inputClass}
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={process.arrival}
                      onChange={(event) => updateProcess(index, "arrival", event.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label={`Ráfaga del proceso ${process.id || index + 1}`}
                      className={inputClass}
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={process.burst}
                      onChange={(event) => updateProcess(index, "burst", event.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-[#646873] transition hover:bg-[#f5f1e8] hover:text-[#14171f] disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      onClick={() => removeProcess(index)}
                      disabled={processes.length <= 1}
                      aria-label={`Quitar proceso ${process.id}`}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="rounded-lg border border-[#ded8cd] px-4 py-2.5 text-sm font-semibold text-[#3c414a] transition hover:border-[var(--proceso)] hover:text-[var(--proceso)] disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={addProcess}
            disabled={processes.length >= 10}
          >
            Agregar
          </button>
          <button
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            style={{ backgroundColor: "var(--proceso)" }}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Ejecutando…" : "Ejecutar"}
          </button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {result && (
        <section className="space-y-5" aria-live="polite">
          <div>
            <p className="eyebrow">Resultado</p>
            <h2 className="text-2xl font-bold tracking-tight text-[#14171f]">Ejecución paso a paso</h2>
          </div>

          <Gantt timeline={result.timeline} index={currentStep} onChange={setCurrentStep} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-panel"><Metric label="Espera promedio" value={result.averages.waiting} /></div>
            <div className="card-panel"><Metric label="Retorno promedio" value={result.averages.turnaround} /></div>
          </div>

          <div className="card-panel space-y-4">
            <div>
              <p className="eyebrow">Resumen</p>
              <h3 className="mb-0 text-lg font-bold">Tiempos por proceso</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e7e1d6]">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-[#f8f5ee] text-xs uppercase tracking-wider text-[#646873]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Proceso</th>
                    <th className="px-4 py-3 font-semibold">Fin</th>
                    <th className="px-4 py-3 font-semibold">Retorno</th>
                    <th className="px-4 py-3 font-semibold">Espera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e1d6]">
                  {result.processes.map((process) => (
                    <tr key={process.id}>
                      <th className="px-4 py-3 font-semibold text-[#14171f]">{process.id}</th>
                      <td className="px-4 py-3 font-mono tabular-nums">{process.completion}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{process.turnaround}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{process.waiting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
