'use client';
import { useState } from 'react';
import { Alert, Button, Section } from '@dukani/ui-kit';
import { EntryShell } from '../../common/components/EntryShell';
import { useStartEntry } from '../../common/hooks/use-start-entry';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
export function EntryServiceScreen() {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const { startNew } = useStartEntry();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <EntryShell title={t('addService')} back={go.method}>
      <Section title={t('service')}>
        <p>{t('serviceHint')}</p>
        <Button
          loading={busy}
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void startNew({ kind: 'Service' })
              .catch(() => setFailed(true))
              .finally(() => setBusy(false));
          }}
        >
          {t('addService')}
        </Button>
        {failed ? <Alert tone="danger" title={t('startFailed')} /> : null}
      </Section>
    </EntryShell>
  );
}
