/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdf-parse"],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
