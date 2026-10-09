import { useMarketingTranslations } from '../ui/i18n/use-marketing-translations';
import { ButtonLink } from '@dukani/ui-kit';
import { createMarketingContent } from '../content';
import type { LandingLinks } from '../links';
import { ProductVisual } from './ProductVisual';

/** «Hero» (274:13): copy + CTAs, and a product visual card (desktop: side by side; mobile: stacked). */
export function Hero({ links }: { links: LandingLinks }) {
  const t = useMarketingTranslations();
  const { HERO } = createMarketingContent(t);

  return (
    <section id="top" className="bg-brand-subtle/60">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 md:px-10 lg:grid-cols-[1fr_500px] lg:gap-16 lg:py-20 xl:px-20">
        <div className="flex flex-col gap-5">
          <h1 className="text-display-l text-fg-primary lg:text-[3rem] lg:leading-[4.5rem]">{HERO.title}</h1>
          <p className="text-body-l text-fg-secondary max-w-[720px] lg:text-[1.125rem] lg:leading-[1.7rem]">
            {HERO.lead}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={links.sellerLogin} variant="primary" block={false}>
              {t('sellerLogin')}
            </ButtonLink>
            <div data-theme="customer">
              <ButtonLink href={links.customerLogin} variant="primary" block={false}>
                {t('customerLogin')}
              </ButtonLink>
            </div>
          </div>
          <p className="text-label-s text-fg-brand">{HERO.note}</p>
        </div>
        <ProductVisual />
      </div>
    </section>
  );
}
