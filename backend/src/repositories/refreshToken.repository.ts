import type { RefreshToken } from "@prisma/client";
import { prisma } from "../prisma/client";

/** Data-access for hashed refresh tokens (Feature 7). */
export const refreshTokenRepository = {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revoke(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  },

  revokeByHash(tokenHash: string): Promise<number> {
    return prisma.refreshToken
      .updateMany({ where: { tokenHash }, data: { revoked: true } })
      .then((r) => r.count);
  },

  revokeAllForUser(userId: string): Promise<number> {
    return prisma.refreshToken
      .updateMany({ where: { userId, revoked: false }, data: { revoked: true } })
      .then((r) => r.count);
  },
};
