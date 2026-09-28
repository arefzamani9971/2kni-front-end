import { FOOTER } from '../content';

/** «Footer» (274:64). */
export function LandingFooter() {
  return (
    <footer className="bg-[#0B1220] text-fg-inverse">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-7 text-body-m md:flex-row md:items-center md:justify-between md:px-10 xl:px-20">
        <p>{FOOTER.tagline}</p>
        <p dir="ltr">{FOOTER.domain}</p>
      </div>
    </footer>
  );
}
