import request from "supertest";
import { app, loginAdmin } from "./helpers";

describe("Authentication", () => {
  it("registers a new user and returns a token", async () => {
    const email = `jest_${Date.now()}@rats.dev`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jest User", email, password: "Secret@123" });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("logs in the admin and returns a token", async () => {
    const token = await loginAdmin();
    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(10);
  });

  it("returns the profile for an authenticated request", async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("email");
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("rejects /me without a token (401)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid credentials (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@rats.dev", password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects an empty login body with validation errors (400)", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
