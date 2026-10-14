'use client';
import { useState } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore, useCan } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ListRow, PageState, Section, TextField, useAppErrorMessage } from '@dukani/ui-kit';
import type { EntrySearchFilters } from '../../application/ports';
import { useProductEntryModule } from '../../module';
import { CatalogImage } from '../components/CatalogImage';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryTranslations } from '../i18n/use-entry-translations';

export function EntrySelectionScreen({
  query,
  itemId,
  productId,
  bulk = false,
  filters,
}: {
  query: string;
  itemId?: string;
  productId?: string;
  bulk?: boolean;
  filters?: EntrySearchFilters;
}) {
  const t = useEntryTranslations();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const { catalog, selections } = useProductEntryModule();
  const go = useEntryNav();
  const { startFromCatalog } = useStartEntry({ bulk });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const message = useAppErrorMessage();
  const local = useAppQuery({
    queryKey: ['entry-selection', store.id, 'local', productId],
    enabled: !!productId,
    queryFn: ({ signal }) => catalog.storeProduct(store.id, productId!, signal),
  });
  const id = itemId ?? local.data?.catalogItemId;
  const detail = useAppQuery({
    queryKey: ['entry-selection', store.id, 'catalog', id],
    enabled: !!id,
    queryFn: ({ signal }) => catalog.catalogItem(store.id, id!, signal),
  });
  const cache = useQueryCache();
  const editorKey = ['entry-selection-editor', store.id, id];
  const editor = useAppQuery({
    queryKey: editorKey,
    enabled: !!id,
    queryFn: () => selections.read(store.id, id!),
    staleTime: Infinity,
  });
  const value = editor.data ?? { schemaVersion: 1 as const, localTitle: '', localNote: '' };
  const { localTitle, localNote } = value;
  const change = (patch: Partial<typeof value>) => {
    if (!id) return;
    const next = { ...value, ...patch };
    cache.set(editorKey, next);
    void selections.write(store.id, id, next).catch(() => setFailed(true));
  };
  const back = () => go.nav.push(sellerRoutes.entry.search(store.id, query, bulk, filters));
  const item = detail.data;
  const allowed =
    can &&
    item &&
    editor.isSuccess &&
    item.status !== 'Archived' &&
    (!productId || local.data?.status === 'Active');
  const next = async () => {
    if (!allowed || busy || localTitle.trim().length > 250 || localNote.length > 1000) return;
    setBusy(true);
    setFailed(false);
    try {
      await selections.write(store.id, item.id, value);
      await startFromCatalog(item.id, productId ?? item.myStoreProductId ?? null, { localTitle, localNote });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };
  return (
    <EntryShell
      title={t('selectCatalog')}
      back={back}
      breadcrumb={t('catalogBreadcrumb')}
      actions={
        <>
          <Button
            block
            disabled={!allowed}
            loading={busy}
            onClick={() => {
              void next();
            }}
          >
            {t(bulk ? 'continueStock' : 'reviewContinue')}
          </Button>
          <Button variant="secondary" block onClick={back}>
            {t('back')}
          </Button>
        </>
      }
    >
      <Section title={t('findCatalog')} className="desktop:p-6">
        <TextField
          label={t('nameBarcodeSearch')}
          value={query}
          onChange={(q) => go.nav.replace(sellerRoutes.entry.search(store.id, q, bulk, filters))}
        />
      </Section>
      {detail.error || local.error || editor.error ? (
        <PageState
          kind="error"
          description={message(detail.error ?? local.error ?? editor.error!)}
          action={
            <Button
              onClick={() => {
                void (editor.error
                  ? editor.refetch()
                  : productId && !local.data
                    ? local.refetch()
                    : detail.refetch());
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : !item || editor.isPending ? (
        <PageState kind="loading" />
      ) : (
        <>
          {failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
          {item.status === 'Archived' || local.data?.status === 'Archived' ? (
            <Alert title={t('archivedSelection')} />
          ) : null}
          <div className="desktop:grid-cols-2 desktop:gap-6 grid gap-4">
            <Section title={item.title} className="desktop:p-6">
              <ListRow>{[item.productType.name, item.brand?.name].filter(Boolean).join(' · ')}</ListRow>
              <ListRow>{t(`catalogStatus.${item.status}`)}</ListRow>
              {item.images.map((image) => (
                <CatalogImage key={image.fileId} itemId={item.id} fileId={image.fileId} title={item.title} />
              ))}
              {item.netContentValue ? (
                <ListRow>
                  {item.netContentValue} {item.netContentUnit?.name}
                </ListRow>
              ) : null}
              {item.description ? <ListRow>{item.description}</ListRow> : null}
              {item.attributes.map((a) => (
                <ListRow key={a.attributeId}>
                  {a.name}:{' '}
                  {a.text ??
                    a.number ??
                    (a.bool == null ? a.options.map((o) => o.value).join(' · ') : t(a.bool ? 'yes' : 'no'))}
                  {a.isObsolete ? ' · ' + t('obsoleteValue') : ''}
                </ListRow>
              ))}
              {item.units.map((unit) => (
                <ListRow key={unit.id}>
                  <span>
                    {unit.name} · {unit.baseQty} {item.baseUnit.name}
                  </span>
                  <span dir="ltr">{unit.barcodes.map((b) => b.code).join(' · ')}</span>
                </ListRow>
              ))}
            </Section>
            {productId ? (
              <Section title={t('inStore')} className="desktop:p-6">
                <p>{t('existingHint')}</p>
                <ListRow>{local.data?.title}</ListRow>
                <ListRow>{local.data?.localNote}</ListRow>
              </Section>
            ) : (
              <Section title={t('inStore')} className="desktop:p-6">
                <TextField
                  label={t('displayName')}
                  optional
                  value={localTitle}
                  onChange={(localTitle) => change({ localTitle })}
                  placeholder={item.title}
                  maxLength={250}
                />
                <TextField
                  label={t('privateNote')}
                  optional
                  value={localNote}
                  onChange={(localNote) => change({ localNote })}
                  maxLength={1000}
                />
                <p className="text-body-s text-fg-tertiary">{t('privateInfoHint')}</p>
              </Section>
            )}
          </div>
        </>
      )}
    </EntryShell>
  );
}
