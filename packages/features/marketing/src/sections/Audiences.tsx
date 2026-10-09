import { useMarketingTranslations } from '../ui/i18n/use-marketing-translations';
import { getDirection, useLocale } from '@dukani/i18n';
import { ButtonLink } from '@dukani/ui-kit';
import { createMarketingContent } from '../content';
import type { LandingLinks } from '../links';

/** «Two products» (274:48): seller app (Teal) and buyer app (Indigo) via the theme tokens. */
export function Audiences({ links }: { links: LandingLinks }) {
  const t = useMarketingTranslations();
  const direction = getDirection(useLocale());
  const { AUDIENCES } = createMarketingContent(t);

  const cards = [
    { id: 'seller', theme: 'shop', href: links.sellerLogin, ...AUDIENCES.seller },
    { id: 'buyer', theme: 'customer', href: links.customerLogin, ...AUDIENCES.buyer },
  ] as const;
  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-14 md:grid-cols-2 md:px-10 md:[direction:ltr] lg:pb-[70px] xl:px-20">
        {cards.map((c) => (
          <article
            key={c.id}
            id={c.id}
            data-theme={c.theme}
            dir={direction}
            className="bg-brand-subtle flex flex-col gap-4 rounded-lg p-7"
          >
            <h2 className="text-fg-brand text-[1.75rem] leading-[2.6rem] font-bold">{c.title}</h2>
            <p className="text-body-l text-fg-secondary">{c.text}</p>
            <div>
              <ButtonLink href={c.href} variant="primary" block={false}>
                {c.cta}
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
