export type MemoryAlgorithm = "fifo" | "lru" | "optimal" | "clock" | "lfu";

export interface MemoryStep {
  page: number;
  frames: (number | null)[];
  hit: boolean;
  replaced: number | null;
  note: string;
  extra?: { bits?: number[]; pointer?: number; counts?: (number | null)[] };
}

export interface MemorySimulation {
  steps: MemoryStep[];
  faults: number;
  hits: number;
  faultRate: number;
}

export function simulateMemory(
  algo: MemoryAlgorithm,
  input: { references: number[]; frames: number },
): MemorySimulation {
  if (
    !input ||
    !Array.isArray(input.references) ||
    input.references.length < 1 ||
    input.references.length > 100 ||
    !input.references.every((page) => Number.isInteger(page) && page >= 0)
  ) {
    throw new Error("Las referencias deben contener entre 1 y 100 páginas enteras no negativas.");
  }
  if (!Number.isInteger(input.frames) || input.frames < 1 || input.frames > 10) {
    throw new Error("La cantidad de marcos debe ser un entero entre 1 y 10.");
  }
  if (!["fifo", "lru", "optimal", "clock", "lfu"].includes(algo)) {
    throw new Error("El algoritmo de reemplazo de páginas no es válido.");
  }

  const frames: (number | null)[] = Array(input.frames).fill(null);
  const loadedAt: number[] = Array(input.frames).fill(-1);
  const lastUsed: number[] = Array(input.frames).fill(-1);
  const counts: (number | null)[] = Array(input.frames).fill(null);
  const bits = Array(input.frames).fill(0) as number[];
  const steps: MemoryStep[] = [];
  let pointer = 0;
  let faults = 0;
  let hits = 0;

  for (let index = 0; index < input.references.length; index += 1) {
    const page = input.references[index]!;
    let frameIndex = frames.indexOf(page);
    const hit = frameIndex !== -1;
    let replaced: number | null = null;
    let note: string;

    if (hit) {
      hits += 1;
      lastUsed[frameIndex] = index;
      if (algo === "lfu") counts[frameIndex] = (counts[frameIndex] ?? 0) + 1;
      if (algo === "clock") bits[frameIndex] = 1;
      note = `Acierto: la página ${page} ya está en memoria.`;
    } else {
      faults += 1;
      frameIndex = frames.indexOf(null);

      if (frameIndex === -1) {
        if (algo === "clock") {
          while (bits[pointer] === 1) {
            bits[pointer] = 0;
            pointer = (pointer + 1) % input.frames;
          }
          frameIndex = pointer;
          pointer = (pointer + 1) % input.frames;
        } else if (algo === "optimal") {
          let farthestUse = -1;
          for (let candidate = 0; candidate < frames.length; candidate += 1) {
            const nextUse = input.references.indexOf(frames[candidate]!, index + 1);
            const distance = nextUse === -1 ? Number.POSITIVE_INFINITY : nextUse;
            if (distance > farthestUse) {
              farthestUse = distance;
              frameIndex = candidate;
            }
          }
        } else if (algo === "lru") {
          frameIndex = lastUsed.indexOf(Math.min(...lastUsed));
        } else if (algo === "lfu") {
          let leastCount = Number.POSITIVE_INFINITY;
          let oldestLoad = Number.POSITIVE_INFINITY;
          for (let candidate = 0; candidate < frames.length; candidate += 1) {
            const count = counts[candidate] ?? 0;
            if (count < leastCount || (count === leastCount && loadedAt[candidate]! < oldestLoad)) {
              leastCount = count;
              oldestLoad = loadedAt[candidate]!;
              frameIndex = candidate;
            }
          }
        } else {
          frameIndex = loadedAt.indexOf(Math.min(...loadedAt));
        }

        replaced = frames[frameIndex]!;
        note = `Fallo: se reemplaza la página ${replaced}, ${victimDescription(algo)}.`;
      } else {
        note = `Fallo: la página ${page} se carga en un marco vacío.`;
        if (algo === "clock") pointer = (frameIndex + 1) % input.frames;
      }

      frames[frameIndex] = page;
      loadedAt[frameIndex] = index;
      lastUsed[frameIndex] = index;
      counts[frameIndex] = 1;
      bits[frameIndex] = 1;
    }

    const extra: NonNullable<MemoryStep["extra"]> = {};
    if (algo === "clock") {
      extra.bits = [...bits];
      extra.pointer = pointer;
    } else if (algo === "lfu") {
      extra.counts = [...counts];
    }

    steps.push({
      page,
      frames: [...frames],
      hit,
      replaced,
      note,
      ...(algo === "clock" || algo === "lfu" ? { extra } : {}),
    });
  }

  return { steps, faults, hits, faultRate: faults / input.references.length };
}

function victimDescription(algo: MemoryAlgorithm): string {
  switch (algo) {
    case "fifo":
      return "la más antigua";
    case "lru":
      return "la menos recientemente usada";
    case "optimal":
      return "la que tardará más en volver a usarse";
    case "clock":
      return "la elegida por el algoritmo del reloj";
    case "lfu":
      return "la menos frecuentemente usada";
  }
}
