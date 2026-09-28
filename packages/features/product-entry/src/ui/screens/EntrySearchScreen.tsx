'use client';
import { useAppQuery } from '@dukani/data';
import { isAppError, parseBarcode } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, ListRow, PageState, SearchField, Section } from '@dukani/ui-kit';
import { useState } from 'react';
import type { SearchResult } from '../../application/ports';
import { useProductEntryModule } from '../../module';
import { BackButton } from '../components/BackButton';
import { EntryShell } from '../components/EntryShell';
import { entryKeys } from '../hooks/entry-keys';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';

const looksLikeBarcode = (q: string) => /^[0-9]{8,14}$/.test(q) && parseBarcode(q).ok;

/** search (Figma 312:8803): in your store / in the public catalog / not found → new item (F07, F09). */
export function EntrySearchScreen({ query }: { query: string }) {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const { startNew, startFromCatalog } = useStartEntry();
  const [q, setQ] = useState(query);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const barcode = looksLikeBarcode(query);

  const result = useAppQuery<SearchResult>({
    queryKey: entryKeys(store.id).custom('search', query),
    enabled: query.length > 0,
    queryFn: async ({ signal }) => {
      if (!barcode) return catalog.search(store.id, query, signal);
      const hit = await catalog.lookupBarcode(store.id, query);
      return {
        inStore: hit.matches
          .filter((m) => m.storeProductId)
          .map((m) => ({ storeProductId: m.storeProductId!, catalogItemId: m.catalogItemId, title: m.title, onHandText: `واحد بارکد: ${m.unitName}`, baseUnitName: m.unitName })),
        inCatalog: hit.matches.filter((m) => !m.storeProductId).map((m) => ({ catalogItemId: m.catalogItemId, title: m.title, subtitle: `بارکد ${m.unitName}` })),
      };
    },
  });

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(isAppError(e) ? e.message : 'انجام نشد؛ دوباره تلاش کنید.');
      setBusy(null);
    }
  };

  const data = result.data;
  const nothing = data && data.inStore.length === 0 && data.inCatalog.length === 0;

  return (
    <EntryShell title="نتیجهٔ جست‌وجو" actions={<BackButton onClick={go.method} />}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go.nav.replace(`?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <SearchField label="جست‌وجوی نام یا بارکد" hideLabel value={q} onChange={setQ} />
      </form>
      {error ? <Alert title="انجام نشد" description={error} /> : null}
      {result.isLoading ? <PageState kind="loading" rows={3} /> : null}
      {result.error ? <PageState kind="error" description={result.error.message} /> : null}
      {data && data.inStore.length > 0 ? (
        <Section title="در فروشگاه شما">
          {data.inStore.map((m) => (
            <div key={m.storeProductId} className="flex flex-col gap-3">
              <ListRow>{m.title}</ListRow>
              <ListRow>{m.onHandText}</ListRow>
              <Button
                variant="secondary"
                block
                loading={busy === m.storeProductId}
                onClick={() => run(m.storeProductId, () => startFromStoreProduct(m.storeProductId, m.catalogItemId))}
              >
                افزودن موجودی همین کالا
              </Button>
            </div>
          ))}
        </Section>
      ) : null}
      {data && data.inCatalog.length > 0 ? (
        <Section title="در کاتالوگ عمومی">
          {data.inCatalog.map((m) => (
            <div key={m.catalogItemId} className="flex flex-col gap-3">
              <ListRow>{m.title}</ListRow>
              {m.subtitle ? <ListRow>{m.subtitle}</ListRow> : null}
              <Button variant="secondary" block loading={busy === m.catalogItemId} onClick={() => run(m.catalogItemId, () => startFromCatalog(m.catalogItemId))}>
                انتخاب از کاتالوگ
              </Button>
            </div>
          ))}
        </Section>
      ) : null}
      {data ? (
        <Section title={nothing ? 'چیزی پیدا نشد' : 'پیدا نکردید؟'}>
          {nothing ? <p className="text-body-m text-fg-secondary">«{query}» در فروشگاه و کاتالوگ نیست.</p> : null}
          <Button
            variant="secondary"
            block
            loading={busy === 'new'}
            onClick={() => run('new', () => startNew(barcode ? { barcode: query } : { title: query }))}
          >
            ثبت کالای جدید برای فروشگاه
          </Button>
        </Section>
      ) : null}
    </EntryShell>
  );

  async function startFromStoreProduct(storeProductId: string, catalogItemId: string) {
    // name search returns store products without the catalog id → resolve it from the product
    const id = catalogItemId || (await catalog.storeProductCatalogId(store.id, storeProductId));
    await startFromCatalog(id, storeProductId);
  }
}
