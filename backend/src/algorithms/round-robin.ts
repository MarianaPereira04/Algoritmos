export interface RoundRobinInput {
  processes: { id: string; arrival: number; burst: number }[];
  quantum: number;
}

export interface RoundRobinTimelineEntry {
  type: "run" | "idle";
  pid?: string;
  start: number;
  end: number;
  queue: string[];
  note: string;
}

export interface RoundRobinProcessResult {
  id: string;
  arrival: number;
  burst: number;
  completion: number;
  turnaround: number;
  waiting: number;
}

export interface RoundRobinResult {
  timeline: RoundRobinTimelineEntry[];
  processes: RoundRobinProcessResult[];
  averages: { turnaround: number; waiting: number };
}

export function roundRobin(input: RoundRobinInput): RoundRobinResult {
  if (!input || !Array.isArray(input.processes) || input.processes.length === 0) {
    throw new Error("Debe proporcionarse al menos un proceso.");
  }
  if (!Number.isInteger(input.quantum) || input.quantum < 1) {
    throw new Error("El quantum debe ser un entero mayor o igual a 1.");
  }

  const ids = new Set<string>();
  const ordered = input.processes.map((process, index) => {
    if (!process || typeof process.id !== "string" || process.id.trim() === "") {
      throw new Error("Cada proceso debe tener un identificador válido.");
    }
    if (ids.has(process.id)) {
      throw new Error(`El identificador de proceso '${process.id}' está repetido.`);
    }
    ids.add(process.id);
    if (!Number.isInteger(process.arrival) || process.arrival < 0) {
      throw new Error(`El tiempo de llegada del proceso '${process.id}' debe ser un entero no negativo.`);
    }
    if (!Number.isInteger(process.burst) || process.burst < 1) {
      throw new Error(`La duración del proceso '${process.id}' debe ser un entero mayor o igual a 1.`);
    }
    return { ...process, index, remaining: process.burst, completion: 0 };
  });
  ordered.sort((left, right) => left.arrival - right.arrival || left.index - right.index);

  const timeline: RoundRobinTimelineEntry[] = [];
  const ready: typeof ordered = [];
  let nextArrival = 0;
  let time = 0;

  const enqueueArrivals = (throughTime: number): void => {
    while (nextArrival < ordered.length) {
      const arriving = ordered[nextArrival]!;
      if (arriving.arrival > throughTime) break;
      ready.push(arriving);
      nextArrival += 1;
    }
  };

  enqueueArrivals(time);

  while (ready.length > 0 || nextArrival < ordered.length) {
    if (ready.length === 0) {
      const nextProcess = ordered[nextArrival]!;
      const start = time;
      time = nextProcess.arrival;
      enqueueArrivals(time);
      timeline.push({
        type: "idle",
        start,
        end: time,
        queue: ready.map((process) => process.id),
        note: `La CPU queda inactiva hasta la llegada de ${nextProcess.id}.`,
      });
      continue;
    }

    const process = ready.shift()!;
    const start = time;
    const duration = Math.min(input.quantum, process.remaining);
    time += duration;
    process.remaining -= duration;

    // Los procesos que llegan durante el turno pasan delante del proceso interrumpido.
    enqueueArrivals(time);
    if (process.remaining === 0) {
      process.completion = time;
    } else {
      ready.push(process);
    }

    timeline.push({
      type: "run",
      pid: process.id,
      start,
      end: time,
      queue: ready.map((item) => item.id),
      note:
        process.remaining === 0
          ? `${process.id} completa su ejecución.`
          : `${process.id} agota su quantum y vuelve al final de la cola.`,
    });
  }

  const results = ordered.map(({ id, arrival, burst, completion }) => {
    const turnaround = completion - arrival;
    return { id, arrival, burst, completion, turnaround, waiting: turnaround - burst };
  });
  const totals = results.reduce(
    (sum, process) => ({
      turnaround: sum.turnaround + process.turnaround,
      waiting: sum.waiting + process.waiting,
    }),
    { turnaround: 0, waiting: 0 },
  );

  return {
    timeline,
    processes: results,
    averages: {
      turnaround: totals.turnaround / results.length,
      waiting: totals.waiting / results.length,
    },
  };
}
