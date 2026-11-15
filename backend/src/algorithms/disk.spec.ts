import { simulateDisk } from "./disk";

const requests = [98, 183, 37, 122, 14, 124, 65, 67];
const commonInput = { requests, head: 53, maxCylinder: 199, direction: "up" as const };

describe("simulateDisk", () => {
  it.each([
    ["fcfs", "up", 640],
    ["sstf", "up", 236],
    ["scan", "up", 331],
    ["scan", "down", 236],
    ["cscan", "up", 382],
    ["cscan", "down", 386],
  ] as const)("calcula %s en dirección %s: total %i", (algo, direction, total) => {
    const result = simulateDisk(algo, { ...commonInput, direction });
    expect(result.total).toBe(total);
    expect(result.total).toBe(result.steps.reduce((sum, step) => sum + step.distance, 0));
    expect(result.order).toHaveLength(requests.length);
  });

  it("mantiene el orden esperado de SSTF y añade el extremo para SCAN", () => {
    const sstf = simulateDisk("sstf", commonInput);
    expect(sstf.order).toEqual([65, 67, 37, 14, 98, 122, 124, 183]);

    const scan = simulateDisk("scan", {
      requests: [120, 150],
      head: 100,
      maxCylinder: 199,
      direction: "up",
    });
    expect(scan.total).toBe(99);
    expect(scan.steps.some((step) => step.kind === "boundary" && step.to === 199)).toBe(true);
  });

  it("rechaza una entrada inválida con un error en español", () => {
    expect(() =>
      simulateDisk("fcfs", {
        requests: [],
        head: 0,
        maxCylinder: 199,
        direction: "up",
      }),
    ).toThrow("Debe haber entre 1 y 50 solicitudes de disco.");
  });
});
