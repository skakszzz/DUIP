import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828],
    imageSizes: [28, 44, 52, 64, 88, 96, 256, 512],
  },
};

export default nextConfig;
