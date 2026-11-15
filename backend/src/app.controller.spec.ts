import { AppController } from "./app.controller";

describe("AppController", () => {
  it("returns API health information", () => {
    const controller = new AppController();

    expect(controller.getHealth()).toEqual({ status: "ok", name: "OS Lab API" });
  });
});
