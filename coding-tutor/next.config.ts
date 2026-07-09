import type { NextConfig } from "next";

const frameAncestors = [
  "'self'",
  "https://3tiq.ir",
  "https://www.3tiq.ir",
  "http://localhost:3456",
  "http://127.0.0.1:3456",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
