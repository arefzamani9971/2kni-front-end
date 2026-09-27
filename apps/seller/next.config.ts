import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Standalone server bundle for the Docker image (see /Dockerfile).
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  // Workspace packages ship TypeScript sources.
  transpilePackages: [
    '@dukani/app-core',
    '@dukani/auth',
    '@dukani/reports',
    '@dukani/store',
    '@dukani/contracts',
    '@dukani/data',
    '@dukani/design-tokens',
    '@dukani/domain',
    '@dukani/forms',
    '@dukani/http',
    '@dukani/platform',
    '@dukani/product-entry',
    '@dukani/products',
    '@dukani/purchasing',
    '@dukani/routes',
    '@dukani/testing',
    '@dukani/ui-kit',
  ],
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  agentRules: false,
  devIndicators: false,
};

export default config;
