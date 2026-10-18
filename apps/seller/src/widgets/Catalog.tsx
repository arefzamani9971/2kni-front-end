'use client';
import { CatalogScreen } from '@dukani/catalog';
import type { ListViewParams } from '@dukani/domain';
import { useProductEntryActions } from '@dukani/product-entry';
export function Catalog({
  initialTypeId,
  initialQuery,
  initialView,
}: {
  initialTypeId?: string;
  initialQuery?: string;
  initialView?: ListViewParams;
}) {
  const { startFromCatalog } = useProductEntryActions();
  return (
    <CatalogScreen
      initialQuery={initialQuery}
      initialTypeId={initialTypeId}
      initialView={initialView}
      onSelectItem={startFromCatalog}
    />
  );
}
