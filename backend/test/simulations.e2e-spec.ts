import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../src/app.module";

describe("Simulations API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("ejecuta Round Robin y devuelve los tiempos de finalización", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/processes/round-robin")
      .send({
        processes: [
          { id: "P1", arrival: 0, burst: 5 },
          { id: "P2", arrival: 1, burst: 3 },
          { id: "P3", arrival: 2, burst: 1 },
        ],
        quantum: 2,
      })
      .expect(200);
    expect(response.body.processes.map((process: { completion: number }) => process.completion)).toEqual([
      9, 8, 5,
    ]);
  });

  it("expone FIFO, C-SCAN y responde con 404 o 400 según corresponda", async () => {
    const references = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
    const memory = await request(app.getHttpServer())
      .post("/api/memory/fifo")
      .send({ references, frames: 3 })
      .expect(200);
    expect(memory.body.faults).toBe(9);

    const disk = await request(app.getHttpServer())
      .post("/api/disk/cscan")
      .send({
        requests: [98, 183, 37, 122, 14, 124, 65, 67],
        head: 53,
        maxCylinder: 199,
        direction: "up",
      })
      .expect(200);
    expect(disk.body.total).toBe(382);

    await request(app.getHttpServer()).post("/api/memory/xyz").send({ references, frames: 3 }).expect(404);
    await request(app.getHttpServer()).post("/api/memory/fifo").send({ references, frames: 0 }).expect(400);
  });
});
