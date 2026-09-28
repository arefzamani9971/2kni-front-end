'use client';
import { BottomSheet, PageState, ProductDataRow, SearchField } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { useProductSearch } from '../hooks/use-product-search';

/** Sheet to choose a store product for a receipt line (search by name or code). */
export function ProductPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (productId: string) => void }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  const result = useProductSearch(debounced, open);
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="انتخاب کالا" full>
      <div className="flex flex-col gap-3">
        <SearchField label="جست‌وجوی کالا" hideLabel value={q} onChange={setQ} autoFocus />
        {result.isPending ? <PageState kind="loading" rows={3} /> : null}
        {result.data?.length === 0 ? (
          <PageState kind="empty" title="کالایی پیدا نشد" description="کالای تازه را اول از «افزودن کالا» ثبت کنید." />
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
    </BottomSheet>
  );
}
