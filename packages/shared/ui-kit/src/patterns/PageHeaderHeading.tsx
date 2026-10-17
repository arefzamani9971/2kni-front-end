'use client';
import { PageBreadcrumb } from './PageBreadcrumb';
import type { PageHeaderProps } from './PageHeader.types';
import { ScreenHeader } from './ScreenHeader';

/** Figma catalog 358:5348: desktop title with breadcrumb, subtitle and actions. */
export function PageHeaderHeading({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <ScreenHeader
      title={
        <>
          {breadcrumb ? <PageBreadcrumb>{breadcrumb}</PageBreadcrumb> : null}
          {title}
        </>
      }
      subtitle={subtitle}
      actions={actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : undefined}
      className="bg-canvas desktop:px-8 items-end"
    />
  );
}
