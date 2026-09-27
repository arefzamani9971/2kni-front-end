import { ButtonLink } from '@dukani/ui-kit';
import { FOOTER, TRUST } from '../content';
import type { LandingLinks } from '../links';

/** «Trust» (274:59) and «Footer» (274:64). */
export function Trust({ links }: { links: LandingLinks }) {
  return (
    <section id="about" className="bg-surface">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-4 py-16 text-center lg:py-[70px]">
        <h2 className="text-heading-xl text-fg-primary lg:text-[1.875rem] lg:leading-[2.8rem]">{TRUST.title}</h2>
        <p className="text-body-l text-fg-secondary">{TRUST.text}</p>
        <ButtonLink href={links.sellerLogin} variant="primary" block={false}>
          {TRUST.cta}
        </ButtonLink>
      </div>
    </section>
  );
}

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
