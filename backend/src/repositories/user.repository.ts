import type { Prisma, User } from "@prisma/client";
import { prisma } from "../prisma/client";

/** Data-access for the User model. */
export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  count(): Promise<number> {
    return prisma.user.count();
  },
};
