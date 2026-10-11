'use client';
import { useCallback, useState } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, Overlay, PageState } from '@dukani/ui-kit';
import { createEditorSession } from '../../application/editor-session';
import { useCatalogModule } from '../../module';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { CatalogFormSessionProps, FormSession } from './CatalogFormSession.types';

/** Keeps unfinished form values separate from the immutable submitted operation intent. */
export function FormSessionBody<T>({ id, defaults, children }: CatalogFormSessionProps<T>) {
  const { editors } = useCatalogModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const t = useCatalogTexts();
  const query = useAppQuery({
    queryKey: ['catalog-editor', store.id, id],
    queryFn: () => editors.read<T>(store.id, id),
    staleTime: Infinity,
  });
  const [failed, setFailed] = useState(false);
  const [leaving, setLeaving] = useState<{ value: T; done: () => void } | null>(null);
  const [writes] = useState(() => createEditorSession(editors, store.id, id));
  const persist = useCallback(
    async (value: T) => {
      const task = writes.write(value);
      try {
        await task;
        cache.set(['catalog-editor', store.id, id], value);
        setFailed(false);
        return true;
      } catch {
        setFailed(true);
        return false;
      }
    },
    [writes, store.id, id, cache],
  );
  const clear = useCallback(async () => {
    await writes.remove();
    cache.set(['catalog-editor', store.id, id], null);
  }, [writes, store.id, id, cache]);
  if (query.isPending) return <PageState kind="loading" />;
  if (query.error)
    return (
      <PageState
        kind="error"
        action={
          <Button
            onClick={() => {
              void query.refetch();
            }}
          >
            {t('retry')}
          </Button>
        }
      />
    );
  const initial = query.data ?? defaults;
  const session: FormSession<T> = {
    initial,
    persist,
    clear,
    leave(value, done) {
      if (JSON.stringify(value) === JSON.stringify(defaults)) done();
      else setLeaving({ value, done });
    },
  };
  return (
    <>
      {failed ? <Alert tone="danger" title={t('draftSaveFailed')} /> : null}
      {children(session)}
      <Overlay
        open={!!leaving}
        onOpenChange={(open) => {
          if (!open) setLeaving(null);
        }}
        title={t('unsaved')}
        description={t('leaveDescription')}
        actions={
          <>
            <Button
              block
              onClick={() => {
                if (leaving)
                  void persist(leaving.value).then((saved) => {
                    if (saved) leaving.done();
                  });
              }}
            >
              {t('saveDraft')}
            </Button>
            <Button
              block
              variant="secondary"
              onClick={() => {
                if (leaving)
                  void clear()
                    .then(leaving.done)
                    .catch(() => setFailed(true));
              }}
            >
              {t('discard')}
            </Button>
            <Button block variant="secondary" onClick={() => setLeaving(null)}>
              {t('cancel')}
            </Button>
          </>
        }
      />
    </>
  );
}
