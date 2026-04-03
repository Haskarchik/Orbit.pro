import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@tailwindcss/oxide"],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ua',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
