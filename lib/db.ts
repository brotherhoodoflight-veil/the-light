// ============================================================
// VEIL — Database Client (server-only)
// Prisma 7 client bound to a driver adapter. Imported only from
// server contexts (route handlers, server components, seeds).
// The connection URL is supplied at runtime — never in source.
// ============================================================

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client';

function createDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? 'file:./dev.db';
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: createDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export type { Member, AuthAccount } from './generated/prisma/client';