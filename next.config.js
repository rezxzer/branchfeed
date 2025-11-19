/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
    // Quality settings (required for Next.js 16+)
    qualities: [75, 85, 100], // Supported quality values
  },
  // Compression
  compress: true,
  // Production optimizations (swcMinify is default in Next.js 15, no need to specify)
  // Suppress workspace root warning
  // Uncomment if you have multiple lockfiles in parent directories
  // outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig

