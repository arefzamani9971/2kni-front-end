'use client';
import type { Dto } from '@dukani/contracts';
import { Button } from '@dukani/ui-kit';
import { useState } from 'react';

export function SimilarItem({
  item,
  onPick,
}: {
  item: Dto<'CatalogItemSummaryDto'>;
  onPick: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-surface text-fg-primary flex items-center gap-2 rounded-md px-3 py-2">
      <span className="text-body-m flex-1">
        {item.title}
        <span className="text-body-s text-fg-secondary block">
          {[item.productTypeName, item.brandName].filter(Boolean).join(' · ')}
        </span>
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
