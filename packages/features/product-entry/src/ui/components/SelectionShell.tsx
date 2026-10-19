'use client';
import type { ReactNode } from 'react';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { EntryShell } from '../common/components/EntryShell';
import { SelectionSearch } from './SelectionSearch';
import type { SelectionShellProps } from './SelectionShell.types';

/** Page frame of «انتخاب کالای کاتالوگ» (Figma 312:348 / 312:8837): title, trail, back, search and the actions. */
export function SelectionShell({
  search,
  onSearchChange,
  onSearch,
  onBack,
  actions,
  children,
}: SelectionShellProps & { actions: ReactNode; children: ReactNode }) {
  const t = useEntryTranslations();
  return (
    <EntryShell
      title={t('selectCatalog')}
      back={onBack}
      breadcrumb={t('catalogBreadcrumb')}
      actions={actions}
    >
      <SelectionSearch value={search} onChange={onSearchChange} onSubmit={onSearch} />
      {children}
    </EntryShell>
  );
}
