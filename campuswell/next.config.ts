import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "pg", "@prisma/adapter-pg"],
  // Set the workspace root to where next build runs (campuswell/).
  // This prevents the "multiple lockfiles" warning and ensures correct
  // module resolution for the turbopack dev server.
  turbopack: {
    root: process.cwd(),
  },
};

export default analyze(nextConfig);
