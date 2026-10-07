import { cn } from '../lib/cn';
import { AppBar } from '../patterns/AppBar';
import type { AuthSplitProps } from './AuthShell.types';
import { Alert } from '../feedback/Alert';
import { ScreenTop } from './ScreenTop';

/** Seller AUTH-01/02 (358:5341/5342): one form DOM across the mobile flow and desktop brand/card layout. */
export function AuthShellSplit({
  title,
  back,
  introduction,
  identity,
  notice,
  brand,
  recovery = false,
  note,
  footer,
  children,
  actions,
  banner,
  contentClassName,
}: AuthSplitProps) {
  return (
    <div className="bg-canvas md:border-line desktop:max-w-none desktop:flex-row desktop:border-0 mx-auto flex h-dvh w-full max-w-[480px] flex-col md:border-x">
      {brand ? (
        <aside
          className="bg-brand-subtle desktop:flex desktop:px-[clamp(32px,5vw,72px)] hidden w-[38.8889%] max-w-[560px] shrink-0 flex-col justify-center gap-4 px-8"
          aria-label={`${brand.name}، ${brand.workspace}`}
        >
          <div
            className="border-line bg-surface flex size-[72px] items-center justify-center rounded-lg border"
            aria-hidden="true"
          >
            <img
              src={new URL('./assets/seller-brand.svg', import.meta.url).href}
              width={36}
              height={36}
              alt=""
            />
          </div>
          <p className="text-display-l text-fg-brand">{brand.name}</p>
          <p className="text-heading-m text-fg-secondary">{brand.workspace}</p>
          <div className="bg-brand h-1 w-12 rounded-[2px]" aria-hidden="true" />
          <p className="text-body-l text-fg-secondary">{introduction ?? brand.description}</p>
        </aside>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ScreenTop className={cn('desktop:hidden shrink-0', recovery && 'bg-canvas')}>
          <AppBar title={title} back={back} />
        </ScreenTop>
        {banner}
        <main
          className={cn(
            'desktop:block desktop:overflow-y-auto desktop:px-6 desktop:pb-8 desktop:pt-[min(27.734375dvh,284px)] grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto]',
            recovery && 'desktop:mt-0 desktop:gap-0 mt-3 gap-3',
          )}
        >
          <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[480px] desktop:flex-col desktop:gap-5 desktop:rounded-[14px] desktop:border desktop:border-line desktop:bg-surface desktop:p-8 contents">
            <div className="desktop:contents flex flex-col gap-3 overflow-y-auto p-4 *:shrink-0">
              <h1 className="text-heading-l text-fg-primary desktop:block desktop:order-1 hidden">{title}</h1>
              {introduction != null ? (
                <p className={cn('text-body-m text-fg-secondary order-1', brand && 'desktop:hidden')}>
                  {introduction}
                </p>
              ) : null}
              {notice ? (
                <div className="desktop:order-3 order-2">
                  <Alert {...notice} className="items-center" />
                </div>
              ) : null}
              {identity != null ? (
                <div className="text-body-m text-fg-secondary desktop:order-2 desktop:-mt-3.5 order-3">
                  {identity}
                </div>
              ) : null}
              {children != null ? (
                <div className={cn('desktop:gap-5 order-4 flex flex-col gap-3', contentClassName)}>
                  {children}
                </div>
              ) : null}
              {note != null ? (
                <div className="text-body-m text-fg-secondary desktop:text-body-s desktop:text-fg-tertiary order-5">
                  {note}
                </div>
              ) : null}
              {footer != null ? (
                <div className="desktop:flex-row desktop:*:min-w-0 desktop:*:flex-1 order-6 flex flex-col gap-3">
                  {footer}
                </div>
              ) : null}
            </div>
            {actions != null ? (
              <div
                className={cn(
                  'desktop:order-7 pb-safe bg-surface desktop:gap-3 desktop:p-0 flex shrink-0 flex-col gap-2 px-4 pt-4',
                  recovery && 'bg-canvas desktop:bg-surface',
                )}
              >
                {actions}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
