import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/habits-pwa",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // @ts-expect-error -- assetPrefix for static export
  assetPrefix: "/habits-pwa",
};

export default nextConfig;
