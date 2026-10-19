'use client';
import { Alert, Button, ButtonLink, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import { useActiveStore, useCan } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useAttachmentDraft } from '../hooks/use-attachment-draft';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import {
  editAttachmentSelection,
  emptyAttachmentDraft,
  retryFailedAttachments,
} from '../../../domain/catalog-attachment';
import { AttachmentSelectionPanel } from '../components/AttachmentSelectionPanel';
import { AttachmentSummary } from '../components/AttachmentSummary';
import { EntryShell } from '../../common/components/EntryShell';

export function CatalogAttachmentsScreen() {
  const t = useAttachmentTranslations();
  const message = useAppErrorMessage();
  const state = useAttachmentDraft();
  const store = useActiveStore();
  const canManage = useCan('product.manage');
  const draft = state.data;
  const title = t(draft?.stage === 'select' ? 'title' : draft?.stage === 'result' ? 'result' : 'review');
  const failed = draft?.chunks.some((chunk) => chunk.result?.results.some((row) => row.status === 'Failed'));
  return (
    <EntryShell
      key={draft?.stage ?? 'loading'}
      title={title}
      mobileNav={false}
      actions={
        draft && canManage ? (
          <>
            {draft.stage === 'select' ? (
              <Button
                block
                loading={state.busy}
                disabled={!draft.selections.length}
                onClick={() => void state.review()}
              >
                {t('reviewAction', { count: draft.selections.length })}
              </Button>
            ) : null}
            {draft.stage === 'review' ? (
              <>
                <Button block loading={state.busy} onClick={() => void state.submit()}>
                  {t('confirm')}
                </Button>
                <Button
                  block
                  variant="secondary"
                  disabled={state.busy}
                  onClick={() => void state.run(() => state.update(editAttachmentSelection))}
                >
                  {t('edit')}
                </Button>
              </>
            ) : null}
            {draft.stage === 'pending' ? (
              <Button block loading={state.busy} onClick={() => void state.submit()}>
                {t('recover')}
              </Button>
            ) : null}
            {draft.stage === 'result' && failed ? (
              <Button
                block
                variant="secondary"
                onClick={() => void state.run(() => state.update(retryFailedAttachments))}
              >
                {t('retryFailed')}
              </Button>
            ) : null}
            {draft.stage === 'result' ? (
              <Button
                block
                variant="secondary"
                onClick={() => void state.run(() => state.update(emptyAttachmentDraft))}
              >
                {t('title')}
              </Button>
            ) : null}
            <ButtonLink href={sellerRoutes.products.list(store.id)}>{t('back')}</ButtonLink>
          </>
        ) : undefined
      }
    >
      {state.error ? <Alert tone="danger" title={message(state.error)} /> : null}
      {state.isPending ? (
        <PageState kind="loading" />
      ) : !canManage ? (
        <PageState kind="permission" />
      ) : draft ? (
        <>
          {draft.stage === 'pending' ? <Alert tone="warning" title={t('pending')} /> : null}
          {draft.stage === 'select' ? (
            <AttachmentSelectionPanel draft={draft} state={state} />
          ) : (
            <AttachmentSummary draft={draft} />
          )}
        </>
      ) : (
        <Button onClick={() => void state.refetch()}>{t('retry')}</Button>
      )}
    </EntryShell>
  );
}
