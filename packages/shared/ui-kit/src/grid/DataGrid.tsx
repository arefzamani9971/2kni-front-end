'use client';
import { memo, useEffect } from 'react';
import { useHydrated } from '../responsive/use-hydrated';
import { useViewport } from '../responsive/use-viewport';
import type { DataGridComponent, DataGridProps } from './DataGrid.types';
import { DataGridCards } from './DataGridCards';
import { DataGridTable } from './DataGridTable';

/**
 * The list of the project (PAT-LIST-02, Figma Responsive Record List 652:762): one column definition, a table with
 * pager on desktop and project cards with infinite scroll on mobile — same source, selection, sort and actions.
 * Memoized: with stable props (module-level columns and functions) typing in a filter never re-renders the list.
 * Features never pick the presentation; this facade reports it to the source after hydration so exactly one view
 * is fetched (Strategy + Facade, docs/architecture/responsive-components.md).
 *
 * ```tsx
 * // columns, productId, productTitle and productActions are module-level (stable) definitions
 * <DataGrid source={products} columns={productColumns} getRowId={productId} getRowLabel={productTitle}
 *   label={t('products')} unit={t('product')} selection={selection} rowActions={productActions} />
 * ```
 */
export const DataGrid = memo(function DataGrid<T, S extends string = string>(props: DataGridProps<T, S>) {
  const viewport = useViewport();
  const hydrated = useHydrated();
  const { present } = props.source;
  useEffect(() => {
    if (hydrated) present(viewport === 'desktop' ? 'pages' : 'infinite');
  }, [hydrated, viewport, present]);
  return viewport === 'desktop' ? <DataGridTable {...props} /> : <DataGridCards {...props} />;
}) as unknown as DataGridComponent;
