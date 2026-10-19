'use client';
import { Alert } from '@dukani/ui-kit';
import { kindOf } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** «پیش از ثبت»: the preview's warnings, and that a new good stays private until its public review. */
export function ReviewWarnings({ draft, warnings }: { draft: EntryDraft; warnings: readonly string[] }) {
  const t = useEntryTranslations();
  return (
    <Alert
      tone="warning"
      title={t('beforeSubmit')}
      description={
        <ul className="flex list-disc flex-col gap-1 ps-4">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
          {draft.source === 'new' && kindOf(draft) !== 'Service' ? <li>{t('privateBeforeReview')}</li> : null}
        </ul>
      }
    />
  );
}
