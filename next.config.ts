import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@prisma/client", "@prisma/adapter-pg"],
  productionBrowserSourceMaps: false,
};

export default nextConfig;
