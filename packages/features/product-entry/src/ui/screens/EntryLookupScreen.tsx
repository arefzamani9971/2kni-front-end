'use client';
import { useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { parseBarcode } from '@dukani/domain';
import { useAppQuery } from '@dukani/data';
import { useActiveStore, useCan } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  PageState,
  Section,
  ReviewScene,
  ScanWorkspace,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { BarcodeCorrection } from '../components/BarcodeCorrection';
import { useProductEntryModule } from '../../module';
import { EntryShell } from '../components/EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { LOOKUP_COPY } from './EntryLookupScreen.constants';
import { LookupMatchCard } from '../components/LookupMatchCard';
import { isInactiveMatch } from '../../domain/bulk-scan';

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
  const [correctionItem, setCorrectionItem] = useState<string | null>(null);
  const kind = parsed.ok ? result.data?.kind : 'Invalid';
  const select = async (match: Dto<'BarcodeMatchDto'>) => {
    if (busy || !can || isInactiveMatch(match)) return;
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
    if (busy || !can || (kind !== 'Unknown' && kind !== 'Conflict')) return;
    setBusy('new');
    try {
      await startNew({ barcode: kind === 'Unknown' ? canonical : '' });
    } catch {
      setFailed(true);
      setBusy(null);
    }
  };
  const rescan = () =>
    go.nav.push(bulk ? sellerRoutes.entry.bulk(store.id) : sellerRoutes.entry.scan(store.id));
  return (
    <EntryShell
      contextualHeader
      mobileNav={false}
      title={correctionItem ? t('correction.title') : t('barcodeResults')}
      back={rescan}
      actions={
        <Button block variant="secondary" onClick={rescan}>
          {t('backToScanner')}
        </Button>
      }
    >
      <div className="desktop:block hidden" aria-hidden="true" inert>
        <ScanWorkspace
          active={false}
          preview
          hint={t('scanHint')}
          status={t('barcodeResults')}
          actions={[
            { kind: 'keyboard', label: t('manualBarcode'), onClick: rescan },
            { kind: 'layers', label: t('bulkScan'), onClick: rescan },
            { kind: 'settings', label: t('scanSettings'), onClick: rescan },
          ]}
        />
      </div>
      <ReviewScene
        open
        onOpenChange={(open) => {
          if (!open && !correctionItem) rescan();
        }}
        title={correctionItem ? t('correction.title') : t('barcodeResults')}
      >
        {correctionItem ? (
          <BarcodeCorrection itemId={correctionItem} onBack={() => setCorrectionItem(null)} />
        ) : (
          <>
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
              <Alert
                tone={kind === 'Conflict' || kind === 'Invalid' ? 'warning' : 'info'}
                title={t(LOOKUP_COPY[kind])}
              />
            ) : null}
            <div className="desktop:grid-cols-2 desktop:gap-6 grid gap-4">
              {(result.data?.matches ?? []).map((match) => (
                <LookupMatchCard
                  key={`${match.catalogItemId}:${match.catalogItemUnitId}:${match.storeProductUnitId}`}
                  match={match}
                  conflict={kind === 'Conflict'}
                  canManage={can}
                  busy={!!busy}
                  loading={busy === match.catalogItemUnitId}
                  onSelect={() => void select(match)}
                  onCorrect={() => setCorrectionItem(match.catalogItemId)}
                />
              ))}
            </div>
            {kind === 'Conflict' && can ? (
              <Section title={t('correction.choice')}>
                <p className="text-body-m text-warning">{t('correction.noClaim')}</p>
                <Button
                  variant="secondary"
                  block
                  loading={busy === 'new'}
                  disabled={!!busy}
                  onClick={() => void create()}
                >
                  {t('correction.differentItem')}
                </Button>
              </Section>
            ) : null}
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
          </>
        )}
      </ReviewScene>
    </EntryShell>
  );
}
