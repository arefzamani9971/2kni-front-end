import { useMarketingTranslations } from '../ui/i18n/use-marketing-translations';
import { ButtonLink } from '@dukani/ui-kit';
import { createMarketingContent } from '../content';
import type { LandingLinks } from '../links';

/** «Navigation» (274:4): brand at start, anchors in the middle (desktop), customer login at end. */
export function LandingNav({ links }: { links: LandingLinks }) {
  const t = useMarketingTranslations();
  const { NAV_LINKS } = createMarketingContent(t);

  return (
    <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      <nav
        aria-label={t('nav')}
        className="mx-auto flex h-[93px] max-w-[1440px] items-center gap-6 px-4 md:px-10 xl:px-20"
      >
        <a href="#top" className="text-fg-brand text-[1.75rem] leading-[2.4rem] font-bold">
          {t('brand')}
        </a>
        <ul className="text-body-m text-fg-secondary hidden flex-1 items-center justify-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-fg-primary focus-visible:outline-focus rounded-sm focus-visible:outline-2"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div data-theme="customer" className="ms-auto lg:ms-0">
          <ButtonLink
            href={links.customerLogin}
            variant="secondary"
            block={false}
            className="border-brand text-fg-brand"
          >
            {t('customerLogin')}
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
