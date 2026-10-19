'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Button, FormScene, PageState } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../../module';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { CaptureFields } from './CaptureFields';

export function BarcodeCaptureForm({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) {
  const { capture } = useProductEntryModule();
  const store = useActiveStore();
  const t = useEntryTranslations();
  const query = useAppQuery({
    queryKey: ['barcode-capture', store.id],
    queryFn: () => capture.read(store.id),
    staleTime: Infinity,
  });
  return query.error || query.isPending ? (
    <FormScene
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('manualBarcode')}
    >
      {query.error ? (
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
      ) : query.isPending ? (
        <PageState kind="loading" />
      ) : null}
    </FormScene>
  ) : (
    <CaptureFields key={store.id} initial={query.data?.code ?? ''} onCode={onCode} onClose={onClose} />
  );
}
