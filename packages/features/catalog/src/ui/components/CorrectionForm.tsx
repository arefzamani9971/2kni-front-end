'use client';
import { useCallback } from 'react';
import { Alert, Button, FormScene, PageState, Section, TextArea, useAppErrorMessage } from '@dukani/ui-kit';
import { REASON_MAX, toggleField } from '../../domain/correction';
import type { EvidenceFile } from '../../domain/correction.types';
import { useCorrectionEditor } from '../hooks/use-correction-editor';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CorrectionFieldRow } from './CorrectionFieldRow';
import type { CorrectionFormProps } from './CorrectionForm.types';
import { EvidenceField } from './EvidenceField';

/**
 * CAT-CORRECTION «درخواست اصلاح کاتالوگ»: a page on mobile (Figma 312:9108) and a dialog on desktop (312:763) with
 * «توضیح مغایرت» and «اثر درخواست». «چه چیزی اشتباه است؟» lists only the server's capabilities (F11 §6, AC04);
 * the details, optional evidence and nothing changes until a reviewer decides.
 */
export function CorrectionForm({
  capabilities,
  initial,
  persist,
  clear,
  onCreated,
  onBack,
}: CorrectionFormProps) {
  const t = useCatalogTexts();
  const errorMessage = useAppErrorMessage();
  const editor = useCorrectionEditor({ capabilities, initial, persist, clear, onCreated });
  const { draft, setDraft, command } = editor;
  const issue = (field: string) => editor.issues.find((i) => i.field === field);
  const fieldMessage = (key: string) => {
    const found = issue(key);
    return found && found.field !== 'selection' && found.field !== 'reason' && found.field !== 'evidence'
      ? t(`correction.issues.${found.code as 'REQUIRED' | 'TOO_LONG' | 'UNCHANGED'}`)
      : editor.serverMessage(key);
  };
  const selection = issue('selection');
  const reason = issue('reason');
  const evidence = issue('evidence');
  const setEvidence = useCallback(
    (files: readonly EvidenceFile[]) => setDraft((d) => ({ ...d, evidence: files })),
    [setDraft],
  );
  const failure = command.error && !(command.error.kind === 'Validation' && command.error.fieldErrors);

  return (
    <FormScene
      open
      size="full"
      onOpenChange={(next) => (next || command.busy ? undefined : onBack())}
      title={t('correction.title')}
      actions={
        <>
          <Button block loading={command.busy} disabled={editor.locked} onClick={() => void editor.submit()}>
            {t('correction.submit')}
          </Button>
          <Button block variant="secondary" disabled={command.busy} onClick={onBack}>
            {t('correction.back')}
          </Button>
        </>
      }
    >
      {command.unknown ? (
        <PageState
          kind="unknown-result"
          action={<Button onClick={() => void command.retry()}>{t('correction.checkAgain')}</Button>}
        />
      ) : failure ? (
        <Alert tone="danger" title={t('correction.failed')} description={errorMessage(command.error!)} />
      ) : editor.storageError ? (
        <Alert tone="warning" title={t('correction.failed')} />
      ) : null}
      <Section title={t('correction.section')} className="desktop:border-0 desktop:p-0 gap-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-label-s text-fg-primary mb-1">{t('correction.whatIsWrong')}</legend>
          <p className="text-body-s text-fg-secondary">{t('correction.fieldsHint')}</p>
          {selection ? (
            <p role="alert" className="text-caption text-danger">
              {t(`correction.issues.selection.${selection.code as 'NONE' | 'TOO_MANY'}`)}
            </p>
          ) : null}
          {capabilities.fields.map((field) => (
            <CorrectionFieldRow
              key={field.key}
              field={field}
              selected={draft.selected.includes(field.key)}
              value={draft.values[field.key] ?? ''}
              message={fieldMessage(field.key)}
              disabled={editor.locked}
              onToggle={(on) => setDraft((d) => toggleField(d, field, on))}
              onChange={(value) => setDraft((d) => ({ ...d, values: { ...d.values, [field.key]: value } }))}
            />
          ))}
        </fieldset>
        <TextArea
          label={t('correction.reason')}
          required
          rows={3}
          maxLength={REASON_MAX}
          showCount
          hint={t('correction.reasonHint')}
          value={draft.reason}
          disabled={editor.locked}
          onChange={(value) => setDraft((d) => ({ ...d, reason: value }))}
          status={reason || command.error?.fieldErrors?.reason ? 'error' : undefined}
          message={
            reason
              ? t(`correction.issues.reason.${reason.code as 'REQUIRED' | 'TOO_LONG'}`)
              : command.error?.fieldErrors?.reason?.[0]
          }
        />
        <EvidenceField
          initial={initial.evidence}
          onChange={setEvidence}
          disabled={editor.locked}
          message={
            evidence
              ? t(`correction.issues.evidence.${evidence.code as 'UPLOADING' | 'TOO_MANY'}`)
              : command.error?.fieldErrors?.evidenceFileIds?.[0]
          }
        />
      </Section>
      <Section title={t('correction.effectTitle')} className="desktop:bg-muted desktop:border-0">
        <p className="text-body-m text-fg-primary">{t('correction.effectText')}</p>
      </Section>
    </FormScene>
  );
}
