'use client';
import { useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { parseBarcode } from '@dukani/domain';
import { useAppQuery } from '@dukani/data';
import { useActiveStore, useCan } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ListRow, PageState, Section, useAppErrorMessage } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';
const copy = {
  StoreProduct: 'lookup.local',
  GlobalCatalog: 'lookup.catalog',
  Multiple: 'lookup.multiple',
  Unknown: 'lookup.unknown',
  Conflict: 'lookup.conflict',
  Invalid: 'lookup.invalid',
} as const satisfies Record<Dto<'BarcodeLookupKind'>, string>;
export function EntryLookupScreen({
  code,
  origin,
  bulk = false,
}: {
  code: string;
  origin: 'manual' | 'camera';
  bulk?: boolean;
}) {
  const store = useActiveStore();
  const can = useCan('product.manage');
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const message = useAppErrorMessage();
  const go = useEntryNav();
  const { catalog } = useProductEntryModule();
  const { startFromCatalog, startNew } = useStartEntry({ bulk });
  const parsed = parseBarcode(code);
  const canonical = parsed.ok ? parsed.value : code;
  const result = useAppQuery({
    queryKey: ['barcode-lookup', store.id, canonical, origin],
    enabled: parsed.ok,
    queryFn: ({ signal }) => catalog.lookupBarcode(store.id, canonical, signal),
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const kind = parsed.ok ? result.data?.kind : 'Invalid';
  const select = async (match: Dto<'BarcodeMatchDto'>) => {
    if (
      busy ||
      !can ||
      match.catalogStatus === 'Archived' ||
      match.storeProductStatus === 'Archived' ||
      match.unitActive === false
    )
      return;
    setBusy(match.catalogItemUnitId);
    setFailed(false);
    try {
      await startFromCatalog(match.catalogItemId, match.storeProductId ?? null, { match });
    } catch {
      setFailed(true);
      setBusy(null);
    }
  };
  const create = async () => {
    if (busy || !can || kind !== 'Unknown') return;
    setBusy('new');
    try {
      await startNew({ barcode: canonical });
    } catch {
      setFailed(true);
      setBusy(null);
    }
  };
  const rescan = () =>
    go.nav.push(bulk ? '/s/' + store.id + '/entry/bulk' : sellerRoutes.entry.scan(store.id));
  return (
    <EntryShell
      title={t('barcodeResults')}
      back={rescan}
      actions={
        <Button block variant="secondary" onClick={rescan}>
          {t('backToScanner')}
        </Button>
      }
    >
      <p className="text-body-m" dir="ltr">
        <bdi>{canonical}</bdi>
      </p>
      {result.isLoading ? <PageState kind="loading" /> : null}
      {result.error ? (
        <PageState
          kind="error"
          description={message(result.error)}
          action={
            <Button
              onClick={() => {
                void result.refetch();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
      {kind ? (
        <Alert tone={kind === 'Conflict' || kind === 'Invalid' ? 'warning' : 'info'} title={t(copy[kind])} />
      ) : null}
      <div className="desktop:grid-cols-2 desktop:gap-6 grid gap-4">
        {(result.data?.matches ?? []).map((match) => (
          <Section
            key={match.catalogItemId + ':' + match.catalogItemUnitId + ':' + match.storeProductUnitId}
            title={match.title}
            className="desktop:p-6"
          >
            <ListRow>
              {match.unitName} · {presentation.qty(match.baseQty)}
            </ListRow>
            <ListRow>
              {t('lookup.available')}:{' '}
              {match.available != null ? presentation.qty(match.available) : t('lookup.unknownValue')}
            </ListRow>
            <ListRow>
              {t('lookup.price')}:{' '}
              {match.unitPriceAmount != null ? presentation.qty(match.unitPriceAmount) : t('lookup.noPrice')}
            </ListRow>
            <ListRow>{t(`catalogStatus.${match.catalogStatus}`)}</ListRow>
            <Button
              block
              variant="secondary"
              loading={busy === match.catalogItemUnitId}
              disabled={
                !can ||
                !!busy ||
                match.catalogStatus === 'Archived' ||
                match.storeProductStatus === 'Archived' ||
                match.unitActive === false
              }
              onClick={() => {
                void select(match);
              }}
            >
              {t(match.storeProductId ? 'addExistingStock' : 'chooseCatalog')}
            </Button>
          </Section>
        ))}
      </div>
      {kind === 'Unknown' && can ? (
        <Button
          loading={busy === 'new'}
          disabled={!!busy}
          onClick={() => {
            void create();
          }}
        >
          {t('newStoreProduct')}
        </Button>
      ) : null}
      {kind && !result.error ? (
        <>
          <Button
            variant="secondary"
            onClick={() => go.nav.push(sellerRoutes.entry.barcode(store.id) + (bulk ? '?bulk=1' : ''))}
          >
            {t('manualBarcode')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => go.nav.push(sellerRoutes.entry.search(store.id, '', bulk))}
          >
            {t('searchByName')}
          </Button>
        </>
      ) : null}
    </EntryShell>
  );
}
