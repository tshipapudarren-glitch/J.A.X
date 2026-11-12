import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "" },
          { key: "Content-Security-Policy", value: "" },
        ],
      },
    ];
  },
};

export default nextConfig;
