import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { DiskAlgorithm, simulateDisk } from "../algorithms/disk";
import { MemoryAlgorithm, simulateMemory } from "../algorithms/memory";
import { RoundRobinInput, roundRobin } from "../algorithms/round-robin";

@Controller()
export class SimulationsController {
  @Post("processes/round-robin")
  @HttpCode(HttpStatus.OK)
  simulateRoundRobin(@Body() body: RoundRobinInput) {
    if (body === undefined || body === null) {
      throw new BadRequestException("El cuerpo de la solicitud es obligatorio.");
    }
    return this.run(() => roundRobin(body));
  }

  @Post("memory/:algo")
  @HttpCode(HttpStatus.OK)
  simulateMemory(@Param("algo") algo: string, @Body() body: { references: number[]; frames: number }) {
    const algorithms: MemoryAlgorithm[] = ["fifo", "lru", "optimal", "clock", "lfu"];
    if (!algorithms.includes(algo as MemoryAlgorithm)) {
      throw new NotFoundException(`El algoritmo de memoria '${algo}' no existe.`);
    }
    if (body === undefined || body === null) {
      throw new BadRequestException("El cuerpo de la solicitud es obligatorio.");
    }
    return this.run(() => simulateMemory(algo as MemoryAlgorithm, body));
  }

  @Post("disk/:algo")
  @HttpCode(HttpStatus.OK)
  simulateDisk(
    @Param("algo") algo: string,
    @Body() body: { requests: number[]; head: number; maxCylinder: number; direction: "up" | "down" },
  ) {
    const algorithms: DiskAlgorithm[] = ["fcfs", "sstf", "scan", "cscan"];
    if (!algorithms.includes(algo as DiskAlgorithm)) {
      throw new NotFoundException(`El algoritmo de disco '${algo}' no existe.`);
    }
    if (body === undefined || body === null) {
      throw new BadRequestException("El cuerpo de la solicitud es obligatorio.");
    }
    return this.run(() => simulateDisk(algo as DiskAlgorithm, body));
  }

  private run<T>(simulation: () => T): T {
    try {
      return simulation();
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
