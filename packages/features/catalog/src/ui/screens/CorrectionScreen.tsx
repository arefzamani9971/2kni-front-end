'use client';
import type { ReactNode } from 'react';
import { useActiveStore, useCan, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ButtonLink,
  FlowShell,
  FormScene,
  PageState,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { CorrectionForm } from '../components/CorrectionForm';
import { useCorrectionCapabilities } from '../hooks/use-correction-capabilities';
import { useCorrectionDraft } from '../hooks/use-correction-draft';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

/**
 * CAT-CORRECTION `~/catalog/[catalogId]/correction` (F11). The form is a page on mobile and a dialog on desktop;
 * `background` is what the dialog sits on (the app passes the product detail it came from). One open request per
 * item is followed instead of creating another; a private item is edited directly and an archived one takes none.
 */
export function CorrectionScreen({ itemId, background }: { itemId: string; background?: ReactNode }) {
  const t = useCatalogTexts();
  const errorMessage = useAppErrorMessage();
  const store = useActiveStore();
  const nav = useNavigation();
  const allowed = useCan('product.manage');
  const capabilities = useCorrectionCapabilities(allowed ? itemId : null);
  const draft = useCorrectionDraft(itemId);
  const data = capabilities.data;
  const ready = allowed && data && !data.openCorrectionId && !draft.loading && !draft.error;
  const error = capabilities.error ?? draft.error;

  return (
    <>
      {background ?? <FlowShell appBar={{ title: t('correction.title'), back: nav.back }}>{null}</FlowShell>}
      {ready ? (
        <CorrectionForm
          key={itemId}
          capabilities={data}
          initial={draft.initial}
          persist={draft.write}
          clear={draft.clear}
          onCreated={(created) => nav.replace(sellerRoutes.catalog.correctionDetail(store.id, created.id))}
          onBack={nav.back}
        />
      ) : (
        <FormScene
          open
          onOpenChange={(next) => (next ? undefined : nav.back())}
          title={t('correction.title')}
          actions={
            <Button block variant="secondary" onClick={nav.back}>
              {t('correction.back')}
            </Button>
          }
        >
          {!allowed ? (
            <PageState kind="permission" />
          ) : data?.openCorrectionId ? (
            <Alert
              tone="info"
              title={t('correction.openTitle')}
              description={t('correction.openHint')}
              action={
                <ButtonLink href={sellerRoutes.catalog.correctionDetail(store.id, data.openCorrectionId)}>
                  {t('correction.openView')}
                </ButtonLink>
              }
            />
          ) : error?.code === 'CATALOG_ITEM_NOT_EDITABLE' ? (
            <Alert
              tone="info"
              title={t('correction.privateTitle')}
              description={t('correction.privateHint')}
            />
          ) : error?.code === 'CATALOG_ITEM_ARCHIVED' ? (
            <Alert
              tone="warning"
              title={t('correction.archivedTitle')}
              description={t('correction.archivedHint')}
            />
          ) : error ? (
            <PageState
              kind={
                error.kind === 'NotFound' ? 'not-found' : error.kind === 'Permission' ? 'permission' : 'error'
              }
              description={errorMessage(error)}
              action={
                <Button
                  onClick={() => {
                    void capabilities.refetch();
                    void draft.retry();
                  }}
                >
                  {t('retry')}
                </Button>
              }
            />
          ) : (
            <PageState kind="loading" rows={4} />
          )}
        </FormScene>
      )}
    </>
  );
}
