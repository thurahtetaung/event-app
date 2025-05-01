/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false, // Disable Strict Mode
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'mahzkacvsmhusyznsoqf.supabase.co', // Supabase storage
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // For user avatars
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // For event images
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig