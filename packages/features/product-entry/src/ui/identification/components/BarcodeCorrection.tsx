'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Button, PageState } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../../module';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { CorrectionEditor } from './CorrectionEditor';

export function BarcodeCorrection({ itemId, onBack }: { itemId: string; onBack: () => void }) {
  const t = useEntryTranslations();
  const store = useActiveStore();
  const { corrections } = useProductEntryModule();
  const saved = useAppQuery({
    queryKey: ['entry-correction', store.id, itemId],
    queryFn: () => corrections.read(store.id, itemId),
  });
  if (saved.isPending) return <PageState kind="loading" />;
  if (saved.error)
    return (
      <PageState kind="error" action={<Button onClick={() => void saved.refetch()}>{t('retry')}</Button>} />
    );
  return (
    <CorrectionEditor
      key={store.id + ':' + itemId}
      itemId={itemId}
      initial={saved.data ?? { reason: '', field: 'title', value: '', evidenceFileIds: [] }}
      onBack={onBack}
    />
  );
}
