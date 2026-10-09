import createI18nPlugin from '@dukani/i18n/plugin';
import type { NextConfig } from 'next';

/** The landing is fully static: `next build` writes `out/`, served directly by nginx (see /deploy/nginx). */
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: [
    '@dukani/i18n',
    '@dukani/design-tokens',
    '@dukani/domain',
    '@dukani/marketing',
    '@dukani/ui-kit',
  ],
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,
  devIndicators: false,
};

export default createI18nPlugin()(config);
