import { prisma } from "../src/prisma/client";

// Ensure a single, clean disconnect after the whole suite so Jest exits.
afterAll(async () => {
  await prisma.$disconnect();
});
