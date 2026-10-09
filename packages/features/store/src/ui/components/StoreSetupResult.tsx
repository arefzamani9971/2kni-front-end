'use client';
import { useStoreTranslations } from '../i18n/use-store-translations';

import type { AppError } from '@dukani/domain';
import { Alert, Badge, Button, FlowShell, ListRow, ResultScreen, Section } from '@dukani/ui-kit';
import type { StoreProfile } from '../../application/ports';
import type { SectionState, SetupSection } from '../../domain/store-draft.types';
import { createSectionBadges, createSectionLabels } from './StoreSetupResult.constants';
import type { SetupExit } from './StoreSetupResult.types';

/**
 * STORE-SUCCESS (core-user-flows F02 step 4; no Figma frame — composed from ui-kit «ResultScreen»):
 * shown only after the server created the store. Each optional section has its own result; a failed one is
 * retried alone and never re-creates the store (F02 §8). Entering the panel is always possible.
 */
export function StoreSetupResult({
  store,
  sections,
  errors,
  busy,
  onRetry,
  onExit,
}: {
  store: StoreProfile;
  sections: Readonly<Record<SetupSection, SectionState>>;
  errors: Readonly<Partial<Record<SetupSection, AppError>>>;
  busy: boolean;
  onRetry: (section: SetupSection) => void;
  onExit: (to: SetupExit) => void;
}) {
  const t = useStoreTranslations();
  const badges = createSectionBadges(t);
  const labels = createSectionLabels(t);

  const shown = (Object.keys(sections) as SetupSection[]).filter((k) => sections[k] !== 'skipped');
  const failed = shown.filter((k) => sections[k] === 'failed');
  return (
    <FlowShell
      appBar={{ title: t('registerStore') }}
      actions={
        <>
          <Button block disabled={busy} onClick={() => onExit('first-product')}>
            {t('firstProduct')}
          </Button>
          <Button block variant="secondary" disabled={busy} onClick={() => onExit('complete-info')}>
            {t('completeInfo')}
          </Button>
          <Button block variant="secondary" disabled={busy} onClick={() => onExit('home')}>
            {t('enterWorkspace')}
          </Button>
        </>
      }
    >
      <ResultScreen title={t('createdNamed', { name: store.name })} description={t('firstProductHint')} />
      {failed.length ? (
        <Alert tone="warning" title={t('partialSuccess')} description={t('retrySection')} />
      ) : null}
      {shown.length ? (
        <Section title={t('additionalInfo')}>
          {shown.map((k) => {
            const state = sections[k] as Exclude<SectionState, 'skipped'>;
            return (
              <ListRow
                key={k}
                trailing={
                  state === 'failed' ? (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => onRetry(k)}>
                      {t('retry')}
                    </Button>
                  ) : (
                    <Badge tone={badges[state].tone}>{badges[state].label}</Badge>
                  )
                }
              >
                {labels[k]}
                {state === 'failed' && errors[k] ? (
                  <span className="text-body-s text-danger block">{errors[k].message}</span>
                ) : null}
              </ListRow>
            );
          })}
        </Section>
      ) : null}
    </FlowShell>
  );
}
