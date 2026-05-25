import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: remover após corrigir tipos restantes (webhooks, seed, validators)
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
