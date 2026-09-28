/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;