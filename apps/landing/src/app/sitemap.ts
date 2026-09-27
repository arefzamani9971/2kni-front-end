import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://2kni.ir'}/`, changeFrequency: 'monthly', priority: 1 }];
}
