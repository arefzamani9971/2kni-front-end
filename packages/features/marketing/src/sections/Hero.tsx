import { ButtonLink } from '@dukani/ui-kit';
import { HERO } from '../content';
import type { LandingLinks } from '../links';

/** «Hero» (274:13): copy + CTAs, and a product visual card (desktop: side by side; mobile: stacked). */
export function Hero({ links }: { links: LandingLinks }) {
  return (
    <section id="top" className="bg-brand-subtle/60">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 md:px-10 lg:grid-cols-[1fr_500px] lg:gap-16 lg:py-20 xl:px-20">
        <div className="flex flex-col gap-5">
          <h1 className="text-display-l text-fg-primary lg:text-[3rem] lg:leading-[4.5rem]">{HERO.title}</h1>
          <p className="max-w-[720px] text-body-l text-fg-secondary lg:text-[1.125rem] lg:leading-[1.7rem]">{HERO.lead}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={links.sellerLogin} variant="primary" block={false}>
              ورود فروشنده
            </ButtonLink>
            <div data-theme="customer">
              <ButtonLink href={links.customerLogin} variant="primary" block={false}>
                ورود مشتری
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

/** «Product visual» (274:14): a glimpse of the seller home, not a screenshot. */
function ProductVisual() {
  return (
    <figure aria-label="نمونهٔ خانهٔ فروشنده" className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-6 shadow-subtle lg:aspect-square">
      <figcaption className="text-label-m text-fg-brand">{HERO.visual.label}</figcaption>
      <p className="text-[1.75rem] leading-[2.8rem] font-bold text-fg-primary tabular">{HERO.visual.amount}</p>
      <ul className="flex flex-col gap-3.5">
        {HERO.visual.rows.map((r) => (
          <li key={r} className="rounded-md bg-brand-subtle px-3.5 py-3.5 text-label-s text-fg-brand">
            {r}
          </li>
        ))}
      </ul>
    </figure>
  );
}
