/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Suppress workspace root warning
  // Uncomment if you have multiple lockfiles in parent directories
  // outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig

