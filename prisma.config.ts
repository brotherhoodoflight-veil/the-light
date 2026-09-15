// ============================================================
// VEIL — Prisma Configuration (Prisma 7)
// Central config for schema, migrations, and seeding.
// The datasource URL is provided here for the Prisma CLI;
// the runtime PrismaClient receives its driver adapter in
// lib/db.ts.
// ============================================================

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});