import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The shared package ships TypeScript source (status logic, types, translations).
  transpilePackages: ['@whats-poppin/shared'],
};

export default nextConfig;
