'use client';
import { Overlay, PageState, ProductDataRow, SearchField } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { useProductSearch } from '../hooks/use-product-search';

/** Picker for a receipt line's store product (search by name or code): sheet on mobile, dialog on desktop. */
export function ProductPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (productId: string) => void;
}) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  const result = useProductSearch(debounced, open);
  return (
    <Overlay open={open} onOpenChange={onOpenChange} title="انتخاب کالا" size="full">
      <div className="flex flex-col gap-3">
        <SearchField label="جست‌وجوی کالا" hideLabel value={q} onChange={setQ} autoFocus />
        {result.isPending ? <PageState kind="loading" rows={3} /> : null}
        {result.data?.length === 0 ? (
          <PageState
            kind="empty"
            title="کالایی پیدا نشد"
            description="کالای تازه را اول از «افزودن کالا» ثبت کنید."
          />
        ) : null}
        {result.data?.map((p) => (
          <ProductDataRow
            key={p.id}
            title={p.title}
            meta={p.meta}
            onClick={() => {
              onPick(p.id);
              onOpenChange(false);
            }}
          />
        ))}
      </div>
    </Overlay>
  );
}
