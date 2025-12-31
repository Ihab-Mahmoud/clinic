import request from "supertest";
import app from "../app.js";

describe("App routes", () => {
  it("returns ok for the health endpoint", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("applies security headers via helmet", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.headers["x-dns-prefetch-control"]).toBe("off");
  });
});
