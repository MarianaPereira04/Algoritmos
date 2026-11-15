"use client";

import { StepPlayer } from "@/components/StepPlayer";

type GanttStep = {
  type: "run" | "idle";
  pid?: string;
  start: number;
  end: number;
  queue: string[];
  note: string;
};

type GanttProps = {
  timeline: GanttStep[];
  index: number;
  onChange: (index: number) => void;
};

const processColors = ["#4338ca", "#0e7c7b", "#a34378", "#47764b", "#bd681c", "#5368a8", "#8b5caa", "#287a8b", "#a33f3f", "#65751f"];

export function Gantt({ timeline, index, onChange }: GanttProps) {
  const processIds = Array.from(
    new Set(timeline.flatMap((step) => step.type === "run" && step.pid ? [step.pid] : [])),
  );
  const colors = new Map(processIds.map((pid, colorIndex) => [pid, processColors[colorIndex % processColors.length]]));
  const startTime = timeline[0]?.start ?? 0;
  const endTime = timeline[timeline.length - 1]?.end ?? startTime;
  const duration = Math.max(1, endTime - startTime);
  const current = timeline[index];

  return (
    <section className="card-panel gantt-panel" aria-label="Diagrama de Gantt">
      <div className="gantt-controls">
        <p className="eyebrow">Línea de tiempo</p>
        <StepPlayer total={timeline.length} index={index} onChange={onChange} />
      </div>

      <div className="gantt-scroll" role="region" aria-label="Línea de tiempo desplazable" tabIndex={0}>
        <div className="gantt-track">
          {timeline.map((step, stepIndex) => {
            const width = ((step.end - step.start) / duration) * 100;
            const active = stepIndex === index;
            const future = stepIndex > index;
            const isIdle = step.type === "idle";
            return (
              <div
                aria-current={active ? "step" : undefined}
                aria-label={
                  isIdle
                    ? `CPU inactiva, tiempo ${step.start} a ${step.end}`
                    : `${step.pid}, tiempo ${step.start} a ${step.end}`
                }
                className={`gantt-block${active ? " gantt-block-active" : ""}${future ? " gantt-block-future" : ""}${isIdle ? " gantt-block-idle" : ""}`}
                key={`${stepIndex}-${step.start}-${step.end}`}
                style={{
                  width: `${width}%`,
                  background: isIdle
                    ? "repeating-linear-gradient(135deg, #e4e5e8 0, #e4e5e8 7px, #f5f6f7 7px, #f5f6f7 14px)"
                    : colors.get(step.pid ?? "") ?? "var(--proceso)",
                }}
              >
                {isIdle ? "Inactivo" : step.pid}
              </div>
            );
          })}
        </div>
        <div className="gantt-times" aria-hidden="true">
          {timeline.map((step, stepIndex) => {
            const left = ((step.start - startTime) / duration) * 100;
            return (
              <span
                className={`gantt-time${stepIndex === 0 ? " gantt-time-first" : ""}`}
                key={`time-${stepIndex}-${step.start}`}
                style={{ left: `${left}%` }}
              >
                {step.start}
              </span>
            );
          })}
          <span className="gantt-time gantt-time-last" style={{ left: "100%" }}>{endTime}</span>
        </div>
      </div>

      <div className="gantt-details" aria-live="polite">
        <div className="queue-row">
          <span className="queue-label">Cola de listos</span>
          {current?.queue.length ? (
            <ol className="queue-list">
              {current.queue.map((pid, queueIndex) => <li key={`${pid}-${queueIndex}`}>{pid}</li>)}
            </ol>
          ) : (
            <span className="queue-empty">Vacía</span>
          )}
        </div>
        {current && <p className="gantt-note">{current.note}</p>}
      </div>

      <style jsx>{`
        .gantt-panel { display: grid; gap: 1.2rem; }
        .gantt-controls { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
        .gantt-controls .eyebrow { margin: .45rem 0 0; }
        .gantt-scroll { overflow-x: auto; padding: .5rem .15rem .75rem; scrollbar-color: #c8c2b7 transparent; }
        .gantt-track, .gantt-times { min-width: 650px; }
        .gantt-track { display: flex; height: 4.6rem; overflow: hidden; border: 1px solid #d9d4ca; border-radius: .8rem; background: white; }
        .gantt-block { display: grid; min-width: 1px; place-items: center; overflow: hidden; border-right: 1px solid rgb(255 255 255 / 55%); color: white; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .86rem; font-weight: 800; text-shadow: 0 1px 2px rgb(0 0 0 / 20%); transition: opacity 160ms ease, box-shadow 160ms ease, filter 160ms ease; }
        .gantt-block-idle { color: #646873; text-shadow: none; }
        .gantt-block-future { opacity: .23; filter: saturate(.5); }
        .gantt-block-active { position: relative; z-index: 1; box-shadow: inset 0 0 0 3px #14171f, 0 0 0 2px white; }
        .gantt-times { position: relative; height: 1.5rem; color: #646873; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .72rem; font-variant-numeric: tabular-nums; }
        .gantt-time { position: absolute; top: .25rem; transform: translateX(-50%); }
        .gantt-time-first { transform: none; }
        .gantt-time-last { transform: translateX(-100%); }
        .gantt-details { display: grid; gap: .85rem; padding-top: .15rem; }
        .queue-row { display: flex; flex-wrap: wrap; align-items: center; gap: .7rem; }
        .queue-label { color: #646873; font-size: .77rem; font-weight: 750; }
        .queue-list { display: flex; flex-wrap: wrap; gap: .4rem; margin: 0; padding: 0; list-style: none; }
        .queue-list li { padding: .28rem .55rem; border-radius: 999px; background: #eeebfa; color: var(--proceso); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; font-weight: 750; }
        .queue-empty { color: #858993; font-size: .82rem; }
        .gantt-note { margin: 0; color: #3c414a; font-size: .9rem; line-height: 1.5; }
        @media (max-width: 580px) {
          .gantt-controls { flex-direction: column; }
          .gantt-track, .gantt-times { min-width: 620px; }
        }
      `}</style>
    </section>
  );
}
