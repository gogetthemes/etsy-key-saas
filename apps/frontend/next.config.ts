/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://etsy-key-saas.onrender.com/api/:path*'
      }
    ];
  },
};

export default nextConfig;
