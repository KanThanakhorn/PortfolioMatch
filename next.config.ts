import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript is checked separately with `tsc --noEmit` because Next 16.3's
  // build runner cannot parse `tsc --showConfig` in this environment.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
