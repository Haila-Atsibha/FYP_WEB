/** @type {import('next').NextConfig} */
const nextConfig = {
  // ensure turbopack uses the frontend folder as root to avoid workspace lockfile conflicts
  turbopack: {
    root: ".",
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/vercel.svg",
      },
    ];
  },
};

export default nextConfig;
