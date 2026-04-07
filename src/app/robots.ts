import type { MetadataRoute } from 'next';

const SITE_URL = 'https://seoul-kids-cafe.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
