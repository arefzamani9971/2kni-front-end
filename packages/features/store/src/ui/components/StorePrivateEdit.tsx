'use client';
import { Alert, FlowShell, PageState, useAppErrorMessage } from '@dukani/ui-kit';
import type { usePrivateInfoEditor } from '../hooks/use-private-info-editor';
import { useStoreTranslations } from '../i18n/use-store-translations';
import { StorePrivateStep } from './StorePrivateStep';

/** storelegal (358:482) on an existing store: loads the private data, then saves it on its own (F03 §2, §8). */
export function StorePrivateEdit({
  editor,
  onLeave,
}: {
  editor: ReturnType<typeof usePrivateInfoEditor>;
  onLeave: () => void;
}) {
  const t = useStoreTranslations();
  const errorMessage = useAppErrorMessage();
  if (!editor.value)
    return (
      <FlowShell appBar={{ title: t('ownerSettlement'), back: onLeave }}>
        {editor.loadError ? (
          <PageState
            kind={editor.loadError.kind === 'Permission' ? 'permission' : 'error'}
            description={errorMessage(editor.loadError)}
          />
        ) : (
          <PageState kind="loading" rows={4} />
        )}
      </FlowShell>
    );
  return (
    <StorePrivateStep
      context="edit"
      value={editor.value}
      busy={editor.saving}
      banner={
        editor.conflict ? (
          <Alert tone="warning" title={t('conflict')} description={t('privateConflict')} />
        ) : editor.saveError && editor.saveError.kind !== 'Validation' ? (
          <Alert title={t('notSaved')} description={errorMessage(editor.saveError)} />
        ) : undefined
      }
      onSave={(v) => void editor.save(v).then((ok) => ok && onLeave())}
      onSkip={onLeave}
    />
  );
}
