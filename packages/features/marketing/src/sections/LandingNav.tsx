import { ButtonLink } from '@dukani/ui-kit';
import { NAV_LINKS } from '../content';
import type { LandingLinks } from '../links';

/** «Navigation» (274:4): brand at start, anchors in the middle (desktop), customer login at end. */
export function LandingNav({ links }: { links: LandingLinks }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <nav aria-label="ناوبری لندینگ" className="mx-auto flex h-[93px] max-w-[1440px] items-center gap-6 px-4 md:px-10 xl:px-20">
        <a href="#top" className="text-[1.75rem] leading-[2.4rem] font-bold text-fg-brand">
          دکانی
        </a>
        <ul className="hidden flex-1 items-center justify-center gap-7 text-body-m text-fg-secondary lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-sm hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-focus">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div data-theme="customer" className="ms-auto lg:ms-0">
          <ButtonLink href={links.customerLogin} variant="secondary" block={false} className="border-brand text-fg-brand">
            ورود مشتری
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
