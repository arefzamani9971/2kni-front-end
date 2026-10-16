'use client';
import { useReportTranslations } from '../i18n/use-report-translations';
import { Alert, Button, ButtonLink, ListRow, Section, useAppErrorMessage } from '@dukani/ui-kit';
import { useAttention } from '../hooks/use-attention';
import type { AttentionAction } from './AttentionSection.types';

/**
 * «نیازمند توجه»: counts from the action center + the matching fixes (hidden when nothing is open). Counts come
 * only from a successful response; a failure shows an error with retry instead of hiding the section (F04 §10).
 */
export function AttentionSection({ actions }: { actions: readonly AttentionAction[] }) {
  const t = useReportTranslations();
  const errorMessage = useAppErrorMessage();
  const q = useAttention();
  if (!q.data && q.error)
    return (
      <Section title={t('attention')}>
        <Alert
          tone="danger"
          title={t('attentionFailed')}
          description={errorMessage(q.error)}
          action={
            <Button variant="secondary" size="sm" onClick={() => void q.refetch()}>
              {t('retry')}
            </Button>
          }
        />
      </Section>
    );
  if (!q.data || q.data.length === 0) return null;
  const kinds = new Set<string>(q.data.map((i) => i.kind));
  const fixes = actions.filter((a) => kinds.has(a.kind));
  return (
    <Section title={t('attention')}>
      {q.data.map((i) => (
        <ListRow key={i.kind}>{t(`kinds.${i.kind}`, { count: i.count })}</ListRow>
      ))}
      {fixes.map((a) => (
        <ButtonLink key={a.kind} href={a.href}>
          {a.label}
        </ButtonLink>
      ))}
    </Section>
  );
}
