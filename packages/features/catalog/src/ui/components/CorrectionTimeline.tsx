'use client';
import type { CorrectionRequest } from '../../domain/correction.types';
import { ListRow, Section } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { useCorrectionPresentation } from '../i18n/use-correction-presentation';

/** The request's history, oldest first: every status change with its date and note (BIZ-CAT-07). */
export function CorrectionTimeline({ history }: { history: CorrectionRequest['history'] }) {
  const t = useCatalogTexts();
  const presentation = useCorrectionPresentation();
  return (
    <Section title={t('correctionStatus.timeline')}>
      <ol className="flex flex-col gap-2">
        {history.map((entry, index) => (
          <li key={index}>
            <ListRow
              trailing={<span className="text-body-s text-fg-secondary">{presentation.date(entry.at)}</span>}
            >
              <span className="flex flex-col gap-1">
                <span className="text-label-m">{t(`correctionStatus.statuses.${entry.status}`)}</span>
                {entry.note ? (
                  <span className="text-body-s text-fg-secondary whitespace-pre-line">{entry.note}</span>
                ) : null}
              </span>
            </ListRow>
          </li>
        ))}
      </ol>
    </Section>
  );
}
