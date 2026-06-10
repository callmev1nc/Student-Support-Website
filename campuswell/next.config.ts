import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "pg", "@prisma/adapter-pg"],
  // Set the workspace root to where next build runs (campuswell/).
  // This prevents the "multiple lockfiles" warning and ensures correct
  // module resolution for the turbopack dev server.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
