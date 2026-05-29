import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fuojwkehhxorblzyekxx.supabase.co",
      },
    ],
  },
};

export default nextConfig;
