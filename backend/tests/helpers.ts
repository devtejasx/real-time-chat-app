import request from "supertest";
import type { Application } from "express";
import { createApp } from "../src/app";

/** A single app instance reused across the test suite (no port binding). */
export const app: Application = createApp();

/** Log in as the seeded admin and return a JWT. */
export async function loginAdmin(): Promise<string> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@rats.dev",
      password: process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345",
    });
  return res.body?.data?.token as string;
}

/** Fetch the id of the first collection (for detail/history tests). */
export async function firstCollectionId(): Promise<string | undefined> {
  const res = await request(app).get("/api/collections?pageSize=1");
  return res.body?.data?.items?.[0]?.id as string | undefined;
}
