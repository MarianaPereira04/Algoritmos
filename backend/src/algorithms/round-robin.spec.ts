import { roundRobin } from "./round-robin";

describe("roundRobin", () => {
  it("ejecuta por turnos respetando la llegada y el orden FIFO", () => {
    const result = roundRobin({
      processes: [
        { id: "P1", arrival: 0, burst: 5 },
        { id: "P2", arrival: 1, burst: 3 },
        { id: "P3", arrival: 2, burst: 1 },
      ],
      quantum: 2,
    });

    expect(
      result.timeline.map(({ pid, start, end }) => ({ pid, start, end })),
    ).toEqual([
      { pid: "P1", start: 0, end: 2 },
      { pid: "P2", start: 2, end: 4 },
      { pid: "P3", start: 4, end: 5 },
      { pid: "P1", start: 5, end: 7 },
      { pid: "P2", start: 7, end: 8 },
      { pid: "P1", start: 8, end: 9 },
    ]);
    expect(result.processes).toEqual([
      { id: "P1", arrival: 0, burst: 5, completion: 9, turnaround: 9, waiting: 4 },
      { id: "P2", arrival: 1, burst: 3, completion: 8, turnaround: 7, waiting: 4 },
      { id: "P3", arrival: 2, burst: 1, completion: 5, turnaround: 3, waiting: 2 },
    ]);
    expect(result.averages).toEqual({ turnaround: 19 / 3, waiting: 10 / 3 });
  });

  it("añade un segmento inactivo cuando la cola queda vacía", () => {
    const result = roundRobin({
      processes: [
        { id: "P1", arrival: 0, burst: 2 },
        { id: "P2", arrival: 5, burst: 2 },
      ],
      quantum: 2,
    });

    expect(result.timeline).toContainEqual(
      expect.objectContaining({ type: "idle", start: 2, end: 5 }),
    );
  });

  it("rechaza una entrada inválida con un error en español", () => {
    expect(() => roundRobin({ processes: [], quantum: 1 })).toThrow(Error);
    expect(() => roundRobin({ processes: [], quantum: 1 })).toThrow(
      "Debe proporcionarse al menos un proceso.",
    );
  });
});
