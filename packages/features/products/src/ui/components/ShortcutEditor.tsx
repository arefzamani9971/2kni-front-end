'use client';
import { useNavigation } from '@dukani/platform';
import {
  Alert,
  Button,
  ConfirmDialog,
  PageHeader,
  PageShell,
  PageState,
  useAppErrorMessage,
  useConfirmAction,
} from '@dukani/ui-kit';
import type { ShortcutConfiguration, ShortcutDraft } from '../../domain/shortcut.types';
import { useShortcutEditor } from '../hooks/use-shortcut-editor';
import { useProductTranslations } from '../i18n/use-product-translations';
import { ShortcutAddForm } from './ShortcutAddForm';
import { ShortcutPreview } from './ShortcutPreview';
import { ShortcutTable } from './ShortcutTable';

/** Sale shortcuts and quick picks (F10 shortcuts): preview, table, add form and the versioned save. */
export function ShortcutEditor({
  initial,
  reload,
}: {
  initial: ShortcutConfiguration | ShortcutDraft;
  reload: () => Promise<void>;
}) {
  const nav = useNavigation();
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const editor = useShortcutEditor(initial);
  // reading the saved configuration again drops the unsaved edits: confirmed once, open until it is back
  const reloadSaved = useConfirmAction(reload);
  const save = (
    <Button
      loading={editor.busy}
      disabled={!editor.canManage || editor.busy || editor.frozen}
      onClick={() => void editor.submit()}
    >
      {t('shortcuts.save')}
    </Button>
  );
  return (
    <PageShell
      title={t('shortcuts.title')}
      header={
        <PageHeader
          back={nav.back}
          title={t('shortcuts.title')}
          subtitle={t('shortcuts.hint')}
          actions={save}
        />
      }
      actions={save}
      actionsClassName="desktop:hidden"
    >
      <ShortcutPreview items={editor.items} />
      {editor.saved ? <Alert tone="info" title={t('shortcuts.saved')} /> : null}
      {editor.frozen ? (
        <PageState
          kind="unknown-result"
          action={
            <Button disabled={editor.busy} onClick={() => void editor.submit()}>
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {editor.error ? (
        <>
          <Alert tone="danger" title={t('shortcuts.failed')} />
          <Button variant="secondary" onClick={() => reloadSaved.open()}>
            {t('shortcuts.reload')}
          </Button>
        </>
      ) : null}
      <div className="desktop:grid-cols-3 grid gap-6">
        <ShortcutTable editor={editor} />
        <ShortcutAddForm editor={editor} />
      </div>
      <ConfirmDialog
        {...reloadSaved.dialog}
        title={t('shortcuts.reload')}
        description={t('shortcuts.reloadHint')}
        confirmLabel={t('shortcuts.reload')}
      >
        {reloadSaved.error ? (
          <Alert tone="danger" title={t('shortcuts.failed')} description={errorMessage(reloadSaved.error)} />
        ) : null}
      </ConfirmDialog>
    </PageShell>
  );
}
