// ============================================================
// VEIL — Next.js Configuration
// Native Node modules used by the database layer are externalized
// so Next does not attempt to bundle them.
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next-build',
  experimental: {
    serverComponentsExternalPackages: [
      'better-sqlite3',
      '@prisma/adapter-better-sqlite3',
    ],
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/prod.db'],
      '/sanctuary/**/*': ['./prisma/prod.db'],
      '/grand-chamber/**/*': ['./prisma/prod.db'],
    },
  },
};

export default nextConfig;