/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false, // Disable Strict Mode
  images: {
    domains: [
      'localhost',
      'mahzkacvsmhusyznsoqf.supabase.co', // Supabase storage
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
}

module.exports = nextConfig