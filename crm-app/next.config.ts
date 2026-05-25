import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typescript: {
    // TODO: remover após corrigir tipos restantes (webhooks, seed, validators)
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: dirname,
  },
  outputFileTracingRoot: dirname,
};

export default nextConfig;
