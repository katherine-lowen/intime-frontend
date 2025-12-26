/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Everything your frontend calls like "/api/..." will be proxied to your backend
      { source: "/api/:path*", destination: "http://localhost:3002/:path*" },
    ];
  },
};

module.exports = nextConfig;
