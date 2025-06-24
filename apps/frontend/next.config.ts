/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      // Proxy specific backend routes, and leave /api/auth for NextAuth
      { source: '/api/signup', destination: `${backendUrl}/api/signup` },
      { source: '/api/keywords/:path*', destination: `${backendUrl}/api/keywords/:path*` },
      { source: '/api/listings/:path*', destination: `${backendUrl}/api/listings/:path*` },
      { source: '/api/admin/:path*', destination: `${backendUrl}/api/admin/:path*` },
    ]
  },
};

export default nextConfig;
