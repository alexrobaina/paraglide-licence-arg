/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep Supabase's server SDK out of the bundle (fixes the
  // "Critical dependency: the request of a dependency is an expression" warning).
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
};

export default nextConfig;
