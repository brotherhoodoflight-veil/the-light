// ============================================================
// VEIL — Next.js Configuration
// Native Node modules used by the database layer are externalized
// so Next does not attempt to bundle them.
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'better-sqlite3',
      '@prisma/adapter-better-sqlite3',
    ],
  },
};

export default nextConfig;