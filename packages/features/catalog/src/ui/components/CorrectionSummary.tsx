'use client';
import type { CorrectionRequest } from '../../domain/correction.types';
import { Badge, KeyValueList, Section } from '@dukani/ui-kit';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { useCorrectionPresentation } from '../i18n/use-correction-presentation';
import { CORRECTION_STATUS_TONE } from './CorrectionSummary.constants';

/** Status, what it means for the store, and the request's facts (subject, date, reason, decision, evidence). */
export function CorrectionSummary({ correction: c }: { correction: CorrectionRequest }) {
  const t = useCatalogTexts();
  const presentation = useCorrectionPresentation();
  return (
    <Section
      title={t('correctionStatus.title')}
      actions={
        <Badge tone={CORRECTION_STATUS_TONE[c.status]}>{t(`correctionStatus.statuses.${c.status}`)}</Badge>
      }
    >
      <p className="text-body-m text-fg-secondary">{t(`correctionStatus.hints.${c.status}`)}</p>
      <KeyValueList
        items={[
          { label: t('correctionStatus.subject'), value: c.subject, emphasis: true },
          { label: t('correctionStatus.created'), value: presentation.date(c.createdAt) },
          {
            label: t('correctionStatus.reason'),
            value: <span className="whitespace-pre-line">{c.reason}</span>,
          },
          ...(c.decisionReason ? [{ label: t('correctionStatus.decision'), value: c.decisionReason }] : []),
          ...(c.evidenceFileIds.length
            ? [
                {
                  label: t('correctionStatus.evidence'),
                  value: t('correctionStatus.evidenceCount', { count: c.evidenceFileIds.length }),
                },
              ]
            : []),
        ]}
      />
    </Section>
  );
}
