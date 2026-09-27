import type { LandingLinks } from './links';
import { Audiences } from './sections/Audiences';
import { Features } from './sections/Features';
import { Hero } from './sections/Hero';
import { LandingNav } from './sections/LandingNav';
import { LandingFooter, Trust } from './sections/Trust';

/** LAND-D01 (Figma 274:3). Server-rendered, no client JS needed; responsive from the 1440 desktop frame. */
export function LandingPage({ links }: { links: LandingLinks }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-30 focus:rounded-md focus:bg-surface focus:p-3">
        پرش به محتوا
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
