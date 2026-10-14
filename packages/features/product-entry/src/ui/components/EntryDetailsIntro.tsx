'use client';
import { Alert, WorkflowStepper } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';

export function EntryDetailsIntro({ standalone }: { standalone: boolean }) {
  const t = useEntryTranslations();
  return standalone ? (
    <Alert tone="info" title={t('standaloneHint')} />
  ) : (
    <div className="desktop:block hidden">
      <WorkflowStepper
        steps={[t('detailsStep'), t('unitsPacks'), t('salePrice')]}
        current={0}
        label={t('newProduct')}
      />
    </div>
  );
}
