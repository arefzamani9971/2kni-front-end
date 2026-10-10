'use client';
import { CatalogScreen } from '@dukani/catalog';
import { useProductEntryActions } from '@dukani/product-entry';
export function Catalog({ initialTypeId, initialQuery }: { initialTypeId?: string; initialQuery?: string }) {
  const { startFromCatalog } = useProductEntryActions();
  return <CatalogScreen initialQuery={initialQuery} initialTypeId={initialTypeId} onSelectItem={startFromCatalog} />;
}
