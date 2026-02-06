import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  env: {
    GENEA_COMMIT_SHA: process.env.GENEA_COMMIT_SHA,
  },
};

export default nextConfig;
