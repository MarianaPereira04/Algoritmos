import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { SimulationsModule } from "./simulations/simulations.module";

@Module({ imports: [SimulationsModule], controllers: [AppController] })
export class AppModule {}
