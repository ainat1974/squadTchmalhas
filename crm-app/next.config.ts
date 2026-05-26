import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname,
  },
  outputFileTracingRoot: dirname,
  async headers() {
    return [
      {
        source: '/widget.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.irroba.com.br https://irroba.com.br https://techmalhas.com.br https://www.techmalhas.com.br https://*.techmalhas.com.br",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
