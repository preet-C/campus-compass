import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // This allows ALL Supabase project URLs
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Keep this if you use Unsplash
      },
    ],
  },
};

export default nextConfig;
