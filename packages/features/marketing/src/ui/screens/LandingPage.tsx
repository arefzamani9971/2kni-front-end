import { useMarketingTranslations } from '../i18n/use-marketing-translations';
import type { LandingLinks } from '../marketing.types';
import { Audiences } from '../components/Audiences';
import { Features } from '../components/Features';
import { Hero } from '../components/Hero';
import { LandingNav } from '../components/LandingNav';
import { LandingFooter } from '../components/LandingFooter';
import { Trust } from '../components/Trust';

/** LAND-D01 (Figma 274:3). Server-rendered, no client JS needed; responsive from the 1440 desktop frame. */
export function LandingPage({ links }: { links: LandingLinks }) {
  const t = useMarketingTranslations();

  return (
    <>
      <a
        href="#main"
        className="focus:bg-surface sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-30 focus:rounded-md focus:p-3"
      >
        {t('skip')}
      </a>
      <LandingNav links={links} />
      <main id="main">
        <Hero links={links} />
        <Features />
        <Audiences links={links} />
        <Trust links={links} />
      </main>
      <LandingFooter />
    </>
  );
}
