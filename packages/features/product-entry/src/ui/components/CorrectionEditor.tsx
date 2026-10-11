'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFinalCommand } from '@dukani/data';
import { newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import {
  Alert,
  Button,
  PageState,
  Section,
  SelectField,
  TextField,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import type { CorrectionDraft } from '../../domain/correction-draft.types';
import { useProductEntryModule } from '../../module';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { CorrectionEvidence } from './CorrectionEvidence';

export function CorrectionEditor({
  itemId,
  initial,
  onBack,
}: {
  itemId: string;
  initial: CorrectionDraft;
  onBack: () => void;
}) {
  const store = useActiveStore();
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  const { commands, corrections, analytics } = useProductEntryModule();
  const started = useRef(0);
  const reported = useRef<string | null>(null);
  useEffect(() => analytics.track({ eventName: 'screen_view', flowId: 'F09' }), [analytics]);
  const [draft, setDraft] = useState(initial);
  const updateEvidence = useCallback(
    (evidence: NonNullable<CorrectionDraft['evidence']>) =>
      setDraft((d) => ({
        ...d,
        evidence,
        evidenceFileIds: evidence.flatMap((i) => (i.fileId ? [i.fileId] : [])),
      })),
    [],
  );
  const [invalid, setInvalid] = useState(false);
  const [storageError, setStorageError] = useState<unknown>();
  const reasonRef = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const write = useCallback(
    (next: CorrectionDraft) => corrections.write(store.id, itemId, next),
    [corrections, store.id, itemId],
  );
  const persist = async (next: CorrectionDraft) => {
    clearTimeout(timer.current);
    setDraft(next);
    await write(next);
  };
  useEffect(() => {
    timer.current = setTimeout(() => {
      void write(draft).catch(setStorageError);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [draft, write]);
  const command = useFinalCommand<CorrectionDraft, string>({
    run: async (d) => {
      started.current = performance.now();
      reported.current = null;
      analytics.track({ eventName: 'submit_started', flowId: 'F09' });
      const intent = d.pending!;
      return (
        await commands.correct(
          store.id,
          itemId,
          {
            reason: intent.reason,
            proposedChanges: { [intent.field]: intent.value },
            evidenceFileIds: [...intent.evidenceFileIds],
          },
          intent.operationId as OperationId,
        )
      ).id;
    },
    onSuccess: async (id, d) => persist({ ...d, pending: undefined, resultId: id }),
  });
  useEffect(() => {
    const kind = command.state.kind;
    if (!['succeeded', 'failed', 'unknown'].includes(kind) || reported.current === kind) return;
    reported.current = kind;
    analytics.track({
      eventName: 'submit_result',
      flowId: 'F09',
      outcome: kind === 'succeeded' ? 'success' : kind === 'unknown' ? 'unknown' : 'failed',
      durationMs: performance.now() - started.current,
    });
  }, [command.state.kind, analytics]);
  const send = async () => {
    if (lock.current) return;
    if (!draft.reason.trim() || !draft.value.trim() || draft.evidence?.some((i) => !i.fileId)) {
      analytics.track({ eventName: 'validation_failed', flowId: 'F09' });
      setInvalid(true);
      reasonRef.current?.focus();
      return;
    }
    lock.current = true;
    try {
      const next =
        draft.pending && command.state.kind !== 'failed'
          ? draft
          : {
              ...draft,
              pending: {
                reason: draft.reason.trim(),
                field: draft.field,
                value: draft.value.trim(),
                evidenceFileIds: draft.evidenceFileIds,
                operationId: newOperationId(),
              },
            };
      await persist(next);
      await command.submit(next);
    } catch (error) {
      setStorageError(error);
    } finally {
      lock.current = false;
    }
  };
  const unknown = command.state.kind === 'unknown' || (!!draft.pending && command.state.kind === 'idle');
  const locked = command.busy || unknown || !!draft.resultId;
  return (
    <div className="flex flex-col gap-4">
      {draft.resultId || command.state.kind === 'succeeded' ? (
        <Alert tone="info" title={t('correction.sent')} description={t('correction.effect')} />
      ) : (
        <>
          <Section title={t('correction.mismatch')}>
            <TextField
              ref={reasonRef}
              label={t('correction.reason')}
              value={draft.reason}
              disabled={locked}
              maxLength={2000}
              status={invalid && !draft.reason.trim() ? 'error' : undefined}
              message={invalid && !draft.reason.trim() ? t('required') : undefined}
              onChange={(reason) => setDraft((d) => ({ ...d, reason }))}
            />
            <SelectField
              label={t('correction.field')}
              value={draft.field}
              disabled={locked}
              options={[
                { value: 'title', label: t('fullName') },
                { value: 'description', label: t('correction.description') },
              ]}
              onChange={(field) =>
                setDraft((d) => ({ ...d, field: field === 'description' ? 'description' : 'title' }))
              }
            />
            <TextField
              label={t('correction.value')}
              value={draft.value}
              disabled={locked}
              maxLength={draft.field === 'title' ? 250 : 2000}
              status={invalid && !draft.value.trim() ? 'error' : undefined}
              message={invalid && !draft.value.trim() ? t('required') : undefined}
              onChange={(value) => setDraft((d) => ({ ...d, value }))}
            />
          </Section>
          <Section title={t('correction.effectTitle')}>
            <p className="text-body-m">{t('correction.effect')}</p>
          </Section>
          <CorrectionEvidence initial={initial.evidence} onChange={updateEvidence} disabled={locked} />
          {unknown ? (
            <PageState
              kind="unknown-result"
              action={<Button onClick={() => void send()}>{t('checkAgain')}</Button>}
            />
          ) : null}
          {command.state.kind === 'failed' ? (
            <Alert tone="danger" title={t('submitFailed')} description={message(command.state.error)} />
          ) : null}
          {storageError ? <Alert tone="danger" title={t('submitFailed')} /> : null}
          <Button
            block
            loading={command.busy}
            disabled={locked || draft.evidence?.some((i) => !i.fileId)}
            onClick={() => void send()}
          >
            {t('correction.submit')}
          </Button>
        </>
      )}
      <Button
        block
        variant="secondary"
        disabled={command.busy || unknown}
        onClick={() => {
          void persist(draft).then(onBack).catch(setStorageError);
        }}
      >
        {t('back')}
      </Button>
    </div>
  );
}
