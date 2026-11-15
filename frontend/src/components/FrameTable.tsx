"use client";

import { StepPlayer } from "@/components/StepPlayer";

export type MemoryStep = {
  page: number;
  frames: (number | null)[];
  hit: boolean;
  replaced: number | null;
  note: string;
  extra?: {
    bits?: number[];
    pointer?: number;
    counts?: (number | null)[];
  };
};

type FrameTableProps = {
  algorithm: "fifo" | "lru" | "optimal" | "clock" | "lfu";
  steps: MemoryStep[];
  index: number;
  onChange: (index: number) => void;
};

export function FrameTable({ algorithm, steps, index, onChange }: FrameTableProps) {
  const current = steps[index];

  return (
    <section className="card-panel space-y-5 border-t-2 border-t-[var(--memoria)]" aria-label="Tabla de marcos de memoria">
      <StepPlayer total={steps.length} index={index} onChange={onChange} />

      <div className="overflow-x-auto rounded-xl border border-[#e7e1d6]">
        <table className="w-full min-w-max border-collapse text-center text-sm">
          <caption className="sr-only">Contenido de cada marco después de cada referencia</caption>
          <thead>
            <tr className="bg-[#f8f5ee] text-xs text-[#646873]">
              <th className="sticky left-0 z-10 min-w-28 bg-[#f8f5ee] px-3 py-3 text-left font-semibold">Marco</th>
              {steps.map((step, stepIndex) => (
                <th
                  aria-current={stepIndex === index ? "step" : undefined}
                  className={`min-w-16 px-3 py-3 font-semibold ${stepIndex === index ? "bg-[#dcefed] text-[var(--memoria)]" : stepIndex > index ? "opacity-35" : ""}`}
                  key={`reference-${stepIndex}`}
                >
                  {step.page}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current?.frames.map((_, frameIndex) => (
              <tr className="border-t border-[#e7e1d6]" key={`frame-${frameIndex}`}>
                <th className="sticky left-0 z-[1] bg-[#fffdf8] px-3 py-3 text-left font-semibold text-[#3c414a]">
                  <span>Marco {frameIndex + 1}</span>
                  {algorithm === "lfu" && (
                    <span className="mt-1 block font-mono text-[.68rem] font-normal text-[#777b84]">
                      Usos: {current.extra?.counts?.[frameIndex] ?? "—"}
                    </span>
                  )}
                </th>
                {steps.map((step, stepIndex) => {
                  const previousPage = stepIndex > 0 ? steps[stepIndex - 1]?.frames[frameIndex] : null;
                  const wasReplaced = step.replaced !== null && previousPage === step.replaced;
                  const isFuture = stepIndex > index;
                  return (
                    <td
                      className={`border-l border-[#f0ece3] px-3 py-3 font-mono tabular-nums ${stepIndex === index ? "bg-[#eff7f6] ring-1 ring-inset ring-[#0e7c7b]/35" : ""} ${isFuture ? "opacity-30" : ""}`}
                      key={`cell-${stepIndex}-${frameIndex}`}
                    >
                      {wasReplaced && <del className="mr-1 text-[#d9482b]">{step.replaced}</del>}
                      <span>{step.frames[frameIndex] ?? "–"}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#ded8cd] bg-[#fbf9f4]">
              <th className="sticky left-0 z-[1] bg-[#fbf9f4] px-3 py-3 text-left text-xs font-semibold text-[#646873]">Resultado</th>
              {steps.map((step, stepIndex) => (
                <td className={`border-l border-[#f0ece3] px-2 py-2 ${stepIndex > index ? "opacity-30" : ""}`} key={`result-${stepIndex}`}>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[.65rem] font-extrabold tracking-wide ${step.hit ? "bg-[#e8f3eb] text-[#2f7d4f]" : "bg-[#faece8] text-[#d9482b]"}`}
                  >
                    {step.hit ? "HIT" : "FALLO"}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {current && (
        <div className="grid gap-3 rounded-xl bg-[#f7f5ef] p-4">
          <p className="m-0 text-sm leading-6 text-[#3c414a]">{current.note}</p>
          {algorithm === "clock" && current.extra?.bits && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#646873]">Bits por marco</span>
              {current.extra.bits.map((bit, frameIndex) => (
                <span className="rounded-md bg-white px-2 py-1 font-mono" key={`bit-${frameIndex}`}>
                  M{frameIndex + 1}: {bit}
                </span>
              ))}
              <span className="ml-1 font-semibold text-[var(--memoria)]">
                Puntero: {current.extra.pointer}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
