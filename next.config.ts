import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@prisma/client", "@prisma/adapter-pg"],
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
