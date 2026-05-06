import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@adminforge/core", "@adminforge/db", "@adminforge/api", "@adminforge/admin-ui", "@adminforge/auth"],
};

export default nextConfig;
