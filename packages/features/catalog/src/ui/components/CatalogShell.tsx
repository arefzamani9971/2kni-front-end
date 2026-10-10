import type { ReactNode } from 'react';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { PageHeader, PageShell } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
export function CatalogShell({
  title,
  actions,
  children,
  back,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  back?: () => void;
}) {
  const store = useActiveStore();
  const nav = useNavigation();
  const t = useCatalogTexts();
  return (
    <PageShell
      title={title}
      header={
        <PageHeader
          breadcrumb={
            <button
              type="button"
              onClick={back ?? nav.back}
              className="focus-visible:outline-focus rounded-sm focus-visible:outline-2"
            >
              {t('catalogBreadcrumb')}
            </button>
          }
          title={title}
          subtitle={t('subtitle', { name: store.name })}
          back={back ?? nav.back}
          actions={actions}
        />
      }
      actionsClassName="desktop:hidden"
      contentClassName="gap-3 desktop:gap-6 desktop:px-8"
      actions={actions}
    >
      {children}
    </PageShell>
  );
}
