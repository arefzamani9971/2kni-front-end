'use client';
import { useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../module';
import { useStartEntry } from '../common/hooks/use-start-entry';
import { useEntryNav } from '../common/hooks/use-entry-nav';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import type { AttachmentStockActionProps } from './AttachmentStockAction.types';

/** Explicit handoff to the existing stock flow; attachment never receives stock itself. */
export function AttachmentStockAction({ catalogItemId, storeProductId }: AttachmentStockActionProps) {
  const t = useAttachmentTranslations();
  const store = useActiveStore();
  const { drafts } = useProductEntryModule();
  const { prepareCatalog } = useStartEntry({ intent: 'compound' });
  const go = useEntryNav();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [service, setService] = useState(false);
  if (service) return <p className="text-body-s">{t('serviceNoStock')}</p>;
  return (
    <>
      <Button
        variant="secondary"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError(false);
          try {
            const fresh = await prepareCatalog(catalogItemId, storeProductId);
            if (fresh.catalog?.kind === 'Service') {
              setService(true);
              return;
            }
            const next = await drafts.save(store.id, { ...fresh, stockDecided: false });
            go.step(next.id, 'stock');
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        {t('addStock')}
      </Button>
      {error ? <Alert tone="danger" title={t('error')} /> : null}
    </>
  );
}
