import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: remover após corrigir tipos restantes (webhooks, seed, validators)
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
