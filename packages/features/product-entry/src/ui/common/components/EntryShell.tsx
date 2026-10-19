'use client';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { useActiveStore } from '@dukani/platform';
import { PageHeader, PageShell, ScreenHeader } from '@dukani/ui-kit';
import type { ReactNode } from 'react';

/** Entry screens of page 17: title + «دکانی · فروشگاه», content, persistent actions, bottom navigation. */
export function EntryShell({
  title,
  actions,
  back,
  breadcrumb,
  contextualHeader = false,
  mobileNav = true,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  back?: () => void;
  breadcrumb?: ReactNode;
  contextualHeader?: boolean;
  mobileNav?: boolean;
  children: ReactNode;
}) {
  const t = useEntryTranslations();
  const store = useActiveStore();
  return (
    <PageShell
      mobileNav={mobileNav}
      title={title}
      subtitle={t('storeSubtitle', { name: store.name })}
      header={
        contextualHeader ? (
          <ScreenHeader
            title={title}
            subtitle={t('storeSubtitle', { name: store.name })}
            actions={<div className="desktop:flex hidden">{actions}</div>}
          />
        ) : back ? (
          <PageHeader
            breadcrumb={breadcrumb}
            title={title}
            subtitle={t('storeSubtitle', { name: store.name })}
            back={back}
            actions={actions}
          />
        ) : undefined
      }
      contentClassName={back ? 'gap-3 desktop:gap-6 desktop:px-8' : undefined}
      actionsClassName={back ? 'desktop:hidden' : undefined}
      actions={actions}
    >
      {children}
    </PageShell>
  );
}
