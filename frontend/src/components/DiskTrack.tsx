"use client";

import { StepPlayer } from "@/components/StepPlayer";

export type DiskStep = {
  kind: "service" | "boundary" | "jump";
  from: number;
  to: number;
  distance: number;
  note: string;
};

type DiskTrackProps = {
  steps: DiskStep[];
  requests: number[];
  head: number;
  maxCylinder: number;
  index: number;
  onChange: (index: number) => void;
};

const width = 900;
const left = 76;
const right = 862;
const axisY = 82;
const rowStart = 144;
const rowHeight = 52;

export function DiskTrack({ steps, requests, head, maxCylinder, index, onChange }: DiskTrackProps) {
  const visibleSteps = steps.slice(0, index + 1);
  const height = Math.max(240, rowStart + Math.max(1, visibleSteps.length) * rowHeight + 24);
  const x = (cylinder: number) => left + (cylinder / maxCylinder) * (right - left);
  const tickCount = Math.min(10, maxCylinder);
  const ticks = Array.from({ length: tickCount + 1 }, (_, tickIndex) =>
    Math.round((maxCylinder * tickIndex) / tickCount),
  );
  const occurrenceCount = new Map<number, number>();
  const current = steps[index];
  const markerCylinder = current?.to ?? head;
  const markerY = current ? rowStart + index * rowHeight : rowStart - 20;

  return (
    <section className="card-panel space-y-4 border-t-2 border-t-[var(--disco)]" aria-label="Recorrido del disco">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow !text-[#8a5a00]">Recorrido</p>
          <p className="m-0 text-xs text-[#646873]">Cilindros de 0 a {maxCylinder}</p>
        </div>
        <StepPlayer total={steps.length} index={index} onChange={onChange} />
      </div>

      <svg
        aria-label={`Recorrido del cabezal entre 0 y ${maxCylinder}, paso ${steps.length ? index + 1 : 0} de ${steps.length}`}
        className="block h-auto w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <text className="svg-caption" x={left} y="25">CILINDROS</text>
        {ticks.map((tick) => (
          <g key={`tick-${tick}`}>
            <line className="grid-line" x1={x(tick)} x2={x(tick)} y1={axisY} y2={height - 16} />
            <line className="axis-tick" x1={x(tick)} x2={x(tick)} y1={axisY - 5} y2={axisY + 5} />
            <text className="tick-label" textAnchor="middle" x={x(tick)} y={axisY - 13}>{tick}</text>
          </g>
        ))}
        <line className="axis-line" x1={left} x2={right} y1={axisY} y2={axisY} />

        {requests.map((request, requestIndex) => {
          const occurrence = occurrenceCount.get(request) ?? 0;
          occurrenceCount.set(request, occurrence + 1);
          const offset = occurrence === 0 ? 0 : occurrence % 2 === 1 ? -7 * Math.ceil(occurrence / 2) : 7 * Math.ceil(occurrence / 2);
          return (
            <circle
              className="request-point"
              cx={x(request)}
              cy={axisY + offset}
              key={`request-${requestIndex}-${request}`}
              r="4.5"
            >
              <title>{`Solicitud: cilindro ${request}`}</title>
            </circle>
          );
        })}

        <circle className="head-start" cx={x(head)} cy={axisY + 17} r="5" />
        <text className="head-start-label" textAnchor="middle" x={x(head)} y={axisY + 34}>inicio</text>

        {visibleSteps.map((step, stepIndex) => {
          const y = rowStart + stepIndex * rowHeight;
          const isCurrent = stepIndex === index;
          const previousY = stepIndex === 0 ? axisY + 40 : rowStart + (stepIndex - 1) * rowHeight;
          const pathClass = `movement movement-${step.kind}${isCurrent ? " movement-current" : ""}`;
          const midX = (x(step.from) + x(step.to)) / 2;
          return (
            <g key={`step-${stepIndex}-${step.kind}-${step.from}-${step.to}`}>
              <text className={`row-label${isCurrent ? " row-label-current" : ""}`} textAnchor="end" x={left - 13} y={y + 4}>
                {stepIndex + 1}
              </text>
              <line className="path-connector" x1={x(step.from)} x2={x(step.from)} y1={previousY} y2={y} />
              <line className={pathClass} x1={x(step.from)} x2={x(step.to)} y1={y} y2={y} />
              <circle className={`step-point${isCurrent ? " step-point-current" : ""}`} cx={x(step.from)} cy={y} r="3.2" />
              <circle className={`step-point${isCurrent ? " step-point-current" : ""}`} cx={x(step.to)} cy={y} r="4.2" />
              {step.kind !== "service" && (
                <text className={`movement-label${isCurrent ? " movement-label-current" : ""}`} textAnchor="middle" x={midX} y={y - 9}>
                  {step.kind === "boundary" ? "extremo" : "salto"}
                </text>
              )}
            </g>
          );
        })}

        <g className="head-marker" transform={`translate(${x(markerCylinder)} ${markerY})`}>
          <circle r="10" />
          <path d="M -4 0 L 0 4 L 6 -4" />
        </g>
        <text className="head-marker-label" textAnchor="middle" x={x(markerCylinder)} y={markerY - 14}>
          Cabezal: {markerCylinder}
        </text>
      </svg>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#646873]" aria-label="Leyenda del recorrido">
        <span className="inline-flex items-center gap-2"><i className="legend-line legend-service" />Atención</span>
        <span className="inline-flex items-center gap-2"><i className="legend-line legend-boundary" />Extremo</span>
        <span className="inline-flex items-center gap-2"><i className="legend-line legend-jump" />Salto</span>
        <span className="inline-flex items-center gap-2"><i className="legend-dot" />Solicitud</span>
      </div>

      <style jsx>{`
        .svg-caption { fill: #646873; font: 750 10px system-ui, sans-serif; letter-spacing: 1.4px; }
        .axis-line, .axis-tick { stroke: #8b8e95; stroke-width: 1.25; }
        .grid-line { stroke: #ece8df; stroke-width: 1; }
        .tick-label { fill: #646873; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; }
        .request-point { fill: #8a5a00; stroke: #fffdf8; stroke-width: 1.5; }
        .head-start { fill: #fffdf8; stroke: #14171f; stroke-width: 2; }
        .head-start-label { fill: #646873; font: 9px system-ui, sans-serif; }
        .path-connector { stroke: #c9c4ba; stroke-width: 1.5; }
        .movement { stroke: #8a5a00; stroke-width: 2.5; fill: none; opacity: .63; }
        .movement-service { stroke-dasharray: none; }
        .movement-boundary { stroke-dasharray: 2 5; stroke-linecap: round; }
        .movement-jump { stroke-dasharray: 8 5; }
        .movement-current { stroke: #6d4600; stroke-width: 4.5; opacity: 1; }
        .step-point { fill: #8a5a00; stroke: #fffdf8; stroke-width: 1; }
        .step-point-current { fill: #14171f; stroke: white; stroke-width: 2; }
        .movement-label { fill: #777b84; font: 9px system-ui, sans-serif; }
        .movement-label-current { fill: #6d4600; font-weight: 800; }
        .row-label { fill: #858993; font: 10px ui-monospace, SFMono-Regular, Menlo, monospace; }
        .row-label-current { fill: #6d4600; font-weight: 800; }
        .head-marker circle { fill: white; stroke: #14171f; stroke-width: 2.5; }
        .head-marker path { stroke: #14171f; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        .head-marker-label { fill: #14171f; font: 750 10px system-ui, sans-serif; }
        .legend-line { display: inline-block; width: 1.5rem; border-top: 2px solid #8a5a00; }
        .legend-boundary { border-top-style: dotted; }
        .legend-jump { border-top-style: dashed; }
        .legend-dot { display: inline-block; width: .55rem; height: .55rem; border-radius: 50%; background: #8a5a00; }
      `}</style>
    </section>
  );
}
