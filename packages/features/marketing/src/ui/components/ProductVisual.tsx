import { useMarketingTranslations } from '../i18n/use-marketing-translations';
import { createMarketingContent } from '../presentation/content.constants';

/** «Product visual» (274:14): a glimpse of the seller home, not a screenshot. */
export function ProductVisual() {
  const t = useMarketingTranslations();
  const { HERO } = createMarketingContent(t);

  return (
    <figure
      aria-label={t('visualLabel')}
      className="border-line bg-surface shadow-subtle flex flex-col gap-3.5 rounded-lg border p-6 lg:aspect-square"
    >
      <figcaption className="text-label-m text-fg-brand">{HERO.visual.label}</figcaption>
      <p className="text-fg-primary tabular text-[1.75rem] leading-[2.8rem] font-bold">
        {HERO.visual.amount}
      </p>
      <ul className="flex flex-col gap-3.5">
        {HERO.visual.rows.map((r) => (
          <li key={r} className="bg-brand-subtle text-label-s text-fg-brand rounded-md px-3.5 py-3.5">
            {r}
          </li>
        ))}
      </ul>
    </figure>
  );
}
