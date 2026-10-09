import { useMarketingTranslations } from '../ui/i18n/use-marketing-translations';
import { createMarketingContent } from '../content';

/** «Footer» (274:64). */
export function LandingFooter() {
  const t = useMarketingTranslations();
  const { FOOTER } = createMarketingContent(t);

  return (
    <footer className="text-fg-inverse bg-[#0B1220]">
      <div className="text-body-m mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-7 md:flex-row md:items-center md:justify-between md:px-10 xl:px-20">
        <p>{FOOTER.tagline}</p>
        <p dir="ltr">{FOOTER.domain}</p>
      </div>
    </footer>
  );
}
