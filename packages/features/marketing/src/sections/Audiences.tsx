import { ButtonLink } from '@dukani/ui-kit';
import { AUDIENCES } from '../content';
import type { LandingLinks } from '../links';

/** «Two products» (274:48): seller app (Teal) and buyer app (Indigo) via the theme tokens. */
export function Audiences({ links }: { links: LandingLinks }) {
  const cards = [
    { id: 'seller', theme: 'shop', href: links.sellerLogin, ...AUDIENCES.seller },
    { id: 'buyer', theme: 'customer', href: links.customerLogin, ...AUDIENCES.buyer },
  ] as const;
  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-14 md:grid-cols-2 md:px-10 md:[direction:ltr] lg:pb-[70px] xl:px-20">
        {cards.map((c) => (
          <article key={c.id} id={c.id} data-theme={c.theme} className="flex flex-col gap-4 rounded-lg bg-brand-subtle p-7 [direction:rtl]">
            <h2 className="text-[1.75rem] leading-[2.6rem] font-bold text-fg-brand">{c.title}</h2>
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
