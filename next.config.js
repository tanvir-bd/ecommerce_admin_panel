/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions: true, // simplified
  },
  allowedDevOrigins: ['88.222.241.15', 'adminecom.tanvirlab.com'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
