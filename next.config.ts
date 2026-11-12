import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/projects/pro-archive", destination: "/projects/platform-revenue/", permanent: true }];
  },
};

export default nextConfig;
