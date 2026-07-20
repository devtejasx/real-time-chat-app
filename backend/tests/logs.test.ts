import request from "supertest";
import { app } from "./helpers";

describe("Logs (Feature 12)", () => {
  it("lists logs (paginated)", async () => {
    const res = await request(app).get("/api/logs");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(typeof res.body.data.total).toBe("number");
  });

  it("filters logs by type", async () => {
    const res = await request(app).get("/api/logs?type=AUTH");
    expect(res.status).toBe(200);
    // Every returned entry (if any) should match the requested type.
    for (const log of res.body.data.items) {
      expect(log.type).toBe("AUTH");
    }
  });

  it("rejects an invalid type filter (400)", async () => {
    const res = await request(app).get("/api/logs?type=NONSENSE");
    expect(res.status).toBe(400);
  });
});
