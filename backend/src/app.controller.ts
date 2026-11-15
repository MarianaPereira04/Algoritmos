import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  getHealth(): { status: string; name: string } {
    return { status: "ok", name: "OS Lab API" };
  }
}
