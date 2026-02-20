/** @type {import('next').NextConfig} */
const nextConfig = {
  // ensure turbopack uses the frontend folder as root to avoid workspace lockfile conflicts
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
