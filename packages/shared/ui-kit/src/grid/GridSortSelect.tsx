'use client';
import type { SortRule } from '@dukani/domain';
import { SelectField } from '../fields/SelectField';
import { useUiTranslations } from '../i18n/use-ui-translations';

/** Mobile sort: the same server sort fields as the desktop headers, as one choice («نام کالا، صعودی»). */
export function GridSortSelect<S extends string>({
  columns,
  sort,
  onSort,
}: {
  columns: readonly { readonly header: string; readonly sortField: S }[];
  sort: readonly SortRule<S>[];
  onSort: (sort: SortRule<S>[]) => void;
}) {
  const t = useUiTranslations();
  const options = [
    { value: 'default', label: t('grid.sortDefault') },
    ...columns.flatMap((column) => [
      { value: `asc:${column.sortField}`, label: t('grid.sortAsc', { name: column.header }) },
      { value: `desc:${column.sortField}`, label: t('grid.sortDesc', { name: column.header }) },
    ]),
  ];
  const primary = sort[0];
  return (
    <SelectField
      label={t('grid.sort')}
      value={primary ? `${primary.direction}:${primary.field}` : 'default'}
      options={options}
      onChange={(value) => {
        const match = columns.find((column) => value.endsWith(`:${column.sortField}`));
        onSort(
          match ? [{ field: match.sortField, direction: value.startsWith('desc:') ? 'desc' : 'asc' }] : [],
        );
      }}
    />
  );
}
