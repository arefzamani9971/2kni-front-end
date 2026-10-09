import { useMarketingTranslations } from '../ui/i18n/use-marketing-translations';
import { getDirection, useLocale } from '@dukani/i18n';
import { createMarketingContent } from '../content';

/** «Features» (274:32): three cards; the order icon uses the customer (Indigo) identity. */
export function Features() {
  const t = useMarketingTranslations();
  const direction = getDirection(useLocale());
  const { FEATURES } = createMarketingContent(t);

  return (
    <section id="features" aria-labelledby="features-title" className="bg-canvas">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-14 md:px-10 lg:py-[72px] xl:px-20">
        <h2 id="features-title" className="text-heading-xl text-fg-primary lg:text-[2rem] lg:leading-[3rem]">
          {FEATURES.title}
        </h2>
        <p className="text-body-l text-fg-secondary">{FEATURES.lead}</p>
        {/* desktop places the first card at the left like the Figma grid; reading order stays logical */}
        <ul className="grid gap-4 md:grid-cols-3 md:[direction:ltr] lg:gap-[18px]">
          {FEATURES.items.map((f) => (
            <li
              key={f.title}
              data-theme={f.tone}
              dir={direction}
              className="border-line bg-surface flex flex-col gap-3 rounded-lg border p-6"
            >
              <span aria-hidden className="bg-brand-subtle size-[38px] rounded-full" />
              <h3 className="text-heading-m text-fg-primary">{f.title}</h3>
              <p className="text-body-s text-fg-secondary">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
