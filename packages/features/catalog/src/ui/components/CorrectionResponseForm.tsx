'use client';
import { useCallback, useState } from 'react';
import { Alert, Button, Section, TextArea, useAppErrorMessage } from '@dukani/ui-kit';
import { REASON_MAX } from '../../domain/correction';
import type { EvidenceFile } from '../../domain/correction.types';
import { useCorrectionActions } from '../hooks/use-correction-actions';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { EvidenceField } from './EvidenceField';

/** Reply to a NeedInfo or appeal a rejection with a message and new evidence (F11 §7); the same request continues. */
export function CorrectionResponseForm({
  correctionId,
  kind,
}: {
  correctionId: string;
  kind: 'reply' | 'appeal';
}) {
  const t = useCatalogTexts();
  const errorMessage = useAppErrorMessage();
  const actions = useCorrectionActions(correctionId);
  const [message, setMessage] = useState('');
  const [evidence, setEvidence] = useState<readonly EvidenceFile[]>([]);
  const [checked, setChecked] = useState(false);
  const onEvidence = useCallback((files: readonly EvidenceFile[]) => setEvidence(files), []);
  const uploading = evidence.some((e) => !e.fileId);
  const missing = checked && message.trim() === '';
  const send = async () => {
    setChecked(true);
    if (message.trim() === '' || uploading || actions.pending) return;
    const ok = await actions.run({
      kind,
      body: {
        message: message.trim(),
        evidenceFileIds: evidence.flatMap((e) => (e.fileId ? [e.fileId] : [])),
      },
    });
    if (ok) {
      setMessage('');
      setChecked(false);
    }
  };
  return (
    <Section title={t(`correctionStatus.${kind}`)} className="gap-4">
      {actions.error && actions.error.kind !== 'Validation' ? (
        <Alert
          tone="danger"
          title={t('correctionStatus.actionFailed')}
          description={errorMessage(actions.error)}
        />
      ) : null}
      <TextArea
        label={t('correctionStatus.message')}
        required
        rows={3}
        maxLength={REASON_MAX}
        showCount
        value={message}
        disabled={actions.pending}
        onChange={setMessage}
        status={missing || actions.error?.fieldErrors?.message ? 'error' : undefined}
        message={missing ? t('correctionStatus.messageRequired') : actions.error?.fieldErrors?.message?.[0]}
      />
      <EvidenceField onChange={onEvidence} disabled={actions.pending} />
      <Button block loading={actions.pending} disabled={uploading} onClick={() => void send()}>
        {t('correctionStatus.send')}
      </Button>
    </Section>
  );
}
