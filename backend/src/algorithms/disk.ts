export type DiskAlgorithm = "fcfs" | "sstf" | "scan" | "cscan";
export type DiskDirection = "up" | "down";

export interface DiskStep {
  kind: "service" | "boundary" | "jump";
  from: number;
  to: number;
  distance: number;
  note: string;
}

export interface DiskSimulation {
  steps: DiskStep[];
  total: number;
  order: number[];
}

interface PendingRequest {
  cylinder: number;
  index: number;
}

export function simulateDisk(
  algo: DiskAlgorithm,
  input: {
    requests: number[];
    head: number;
    maxCylinder: number;
    direction: DiskDirection;
  },
): DiskSimulation {
  if (!input || !Array.isArray(input.requests) || input.requests.length < 1 || input.requests.length > 50) {
    throw new Error("Debe haber entre 1 y 50 solicitudes de disco.");
  }
  if (!Number.isInteger(input.maxCylinder) || input.maxCylinder < 1 || input.maxCylinder > 999) {
    throw new Error("El cilindro máximo debe ser un entero entre 1 y 999.");
  }
  if (
    !Number.isInteger(input.head) ||
    input.head < 0 ||
    input.head > input.maxCylinder
  ) {
    throw new Error("La posición de la cabeza debe ser un entero dentro del rango de cilindros.");
  }
  if (
    !input.requests.every(
      (request) =>
        Number.isInteger(request) && request >= 0 && request <= input.maxCylinder,
    )
  ) {
    throw new Error("Cada solicitud debe ser un cilindro entero dentro del rango permitido.");
  }
  if (input.direction !== "up" && input.direction !== "down") {
    throw new Error("La dirección debe ser 'up' o 'down'.");
  }
  if (!["fcfs", "sstf", "scan", "cscan"].includes(algo)) {
    throw new Error("El algoritmo de planificación de disco no es válido.");
  }

  const pending: PendingRequest[] = input.requests.map((cylinder, index) => ({
    cylinder,
    index,
  }));
  const steps: DiskStep[] = [];
  const order: number[] = [];
  let head = input.head;

  const service = (request: PendingRequest): void => {
    steps.push({
      kind: "service",
      from: head,
      to: request.cylinder,
      distance: Math.abs(request.cylinder - head),
      note: `Se atiende la solicitud del cilindro ${request.cylinder}.`,
    });
    head = request.cylinder;
    order.push(request.cylinder);
  };

  const boundary = (cylinder: number): void => {
    if (head === cylinder) return;
    steps.push({
      kind: "boundary",
      from: head,
      to: cylinder,
      distance: Math.abs(cylinder - head),
      note: `La cabeza continúa hasta el extremo ${cylinder} del disco.`,
    });
    head = cylinder;
  };

  const jump = (cylinder: number): void => {
    steps.push({
      kind: "jump",
      from: head,
      to: cylinder,
      distance: input.maxCylinder,
      note: `La cabeza salta al extremo ${cylinder} del disco.`,
    });
    head = cylinder;
  };

  if (algo === "fcfs") {
    for (const request of pending) service(request);
  } else if (algo === "sstf") {
    while (pending.length > 0) {
      let closestIndex = 0;
      for (let index = 1; index < pending.length; index += 1) {
        if (
          Math.abs(pending[index]!.cylinder - head) <
          Math.abs(pending[closestIndex]!.cylinder - head)
        ) {
          closestIndex = index;
        }
      }
      service(pending.splice(closestIndex, 1)[0]!);
    }
  } else {
    const ascending = (left: PendingRequest, right: PendingRequest): number =>
      left.cylinder - right.cylinder || left.index - right.index;
    const descending = (left: PendingRequest, right: PendingRequest): number =>
      right.cylinder - left.cylinder || left.index - right.index;

    const firstSide = pending
      .filter((request) =>
        input.direction === "up"
          ? request.cylinder >= input.head
          : request.cylinder <= input.head,
      )
      .sort(input.direction === "up" ? ascending : descending);
    const otherSide = pending
      .filter((request) =>
        input.direction === "up"
          ? request.cylinder < input.head
          : request.cylinder > input.head,
      )
      .sort(input.direction === "up" ? descending : ascending);

    for (const request of firstSide) service(request);

    if (input.direction === "up") boundary(input.maxCylinder);
    else boundary(0);

    if (algo === "cscan" && otherSide.length > 0) {
      if (input.direction === "up") jump(0);
      else jump(input.maxCylinder);
      otherSide.sort(input.direction === "up" ? ascending : descending);
    }

    for (const request of otherSide) service(request);
  }

  return {
    steps,
    total: steps.reduce((sum, step) => sum + step.distance, 0),
    order,
  };
}
