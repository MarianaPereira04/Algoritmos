import { simulateMemory } from "./memory";

const references = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

describe("simulateMemory", () => {
  it.each([
    ["fifo", 3, 9],
    ["lru", 3, 10],
    ["optimal", 3, 7],
    ["clock", 3, 9],
    ["lfu", 3, 10],
    ["fifo", 4, 10],
  ] as const)("calcula %s con %i marcos: %i fallos", (algo, frames, faults) => {
    const result = simulateMemory(algo, { references, frames });

    expect(result.faults).toBe(faults);
    expect(result.hits + result.faults).toBe(references.length);
    expect(result.steps).toHaveLength(references.length);
    expect(result.faultRate).toBe(faults / references.length);
  });

  it("rechaza referencias o cantidad de marcos inválidas", () => {
    expect(() => simulateMemory("fifo", { references: [], frames: 3 })).toThrow(Error);
    expect(() => simulateMemory("lru", { references: [1.5], frames: 3 })).toThrow(
      "Las referencias deben contener entre 1 y 100 páginas enteras no negativas.",
    );
    expect(() => simulateMemory("clock", { references: [1], frames: 0 })).toThrow(
      "La cantidad de marcos debe ser un entero entre 1 y 10.",
    );
  });
});
