'use client';
import type { Dto } from '@dukani/contracts';
import { Button } from '@dukani/ui-kit';
import { useState } from 'react';

export function SimilarItem({ item, onPick }: { item: Dto<'CatalogItemSummaryDto'>; onPick: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-fg-primary">
      <span className="flex-1 text-body-m">
        {item.title}
        <span className="block text-body-s text-fg-secondary">{[item.productTypeName, item.brandName].filter(Boolean).join(' · ')}</span>
      </span>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          await onPick().catch(() => setBusy(false));
        }}
      >
        انتخاب همین کالا
      </Button>
    </div>
  );
}
