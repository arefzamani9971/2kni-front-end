'use client';
import type { ReactNode } from 'react';
import { createAdaptive } from '../responsive/adaptive';
import { AppBar } from './AppBar';
import { ScreenHeader } from './ScreenHeader';
import { ScreenTop } from '../shells/ScreenTop';
type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  back: () => void;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
};
/** Figma catalog 358:485/5348: mobile AppBar, desktop title/context and actions. */
function PageBar({ title, back }: Props) {
  return (
    <ScreenTop>
      <AppBar title={title} back={back} />
    </ScreenTop>
  );
}
function PageHeading({ title, subtitle, actions, breadcrumb }: Props) {
  return (
    <ScreenHeader
      title={
        <>
          {breadcrumb ? (
            <span className="text-label-s text-fg-tertiary mb-1 block font-medium">{breadcrumb}</span>
          ) : null}
          {title}
        </>
      }
      subtitle={subtitle}
      actions={actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : undefined}
      className="bg-canvas desktop:px-8 items-end"
    />
  );
}
export const PageHeader = createAdaptive<Props>('PageHeader', { mobile: PageBar, desktop: PageHeading });
