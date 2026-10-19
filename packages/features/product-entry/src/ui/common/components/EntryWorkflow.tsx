'use client';
import { WorkflowStepper } from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
export function EntryWorkflow({ current }: { current: 0 | 1 | 2 }) {
  const t = useEntryTranslations();
  return (
    <div className="desktop:block hidden">
      <WorkflowStepper
        steps={[t('detailsStep'), t('unitsPacks'), t('salePrice')]}
        current={current}
        label={t('newProduct')}
      />
    </div>
  );
}
