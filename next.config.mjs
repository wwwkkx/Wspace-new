/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
  },
  experimental: {
    allowedDevOrigins: ['192.168.1.10:3000'],
  },
}

export default nextConfig
