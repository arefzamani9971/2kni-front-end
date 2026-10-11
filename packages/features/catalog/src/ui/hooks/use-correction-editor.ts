'use client';
import { useEffect, useState } from 'react';
import { useInvalidate } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { correctionIssues, toCorrectionRequest } from '../../domain/correction';
import type {
  CorrectionCapabilities,
  CorrectionDraft,
  CorrectionRequest,
  NewCorrection,
} from '../../domain/correction.types';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from './use-catalog-command';

/** Codes after which the capability list (or the open request) must be read again before the seller retries. */
const STALE_CAPABILITY_CODES = new Set([
  'CHANGE_KEY_UNSUPPORTED',
  'CORRECTION_ALREADY_OPEN',
  'CATALOG_ITEM_ARCHIVED',
]);

/**
 * CAT-CORRECTION form state (F11 §6): the draft is saved as it changes, checked before sending and sent once with a
 * persisted operation id, so a lost response or a refresh replays the same request instead of creating a second one.
 */
export function useCorrectionEditor(options: {
  capabilities: CorrectionCapabilities;
  initial: CorrectionDraft;
  persist: (draft: CorrectionDraft) => Promise<void>;
  clear: () => Promise<void>;
  onCreated: (correction: CorrectionRequest) => void;
}) {
  const { capabilities, persist, clear, onCreated } = options;
  const store = useActiveStore();
  const { corrections } = useCatalogModule();
  const invalidate = useInvalidate();
  const [draft, setDraft] = useState(options.initial);
  const [checked, setChecked] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => void persist(draft).catch(() => setStorageError(true)), 300);
    return () => clearTimeout(timer);
  }, [draft, persist]);

  const itemId = capabilities.catalogItemId;
  const command = useCatalogCommand<NewCorrection, CorrectionRequest>(
    `correction:${itemId}`,
    (body, operationId) => corrections.create(store.id, itemId, body, operationId),
    (created) => void clear().finally(() => onCreated(created)),
  );
  const errorCode = command.error?.code;
  useEffect(() => {
    if (errorCode && STALE_CAPABILITY_CODES.has(errorCode))
      void invalidate(['catalog', store.id, 'correction-capabilities', itemId]);
  }, [errorCode, invalidate, store.id, itemId]);

  const issues = correctionIssues(capabilities.fields, draft);
  return {
    draft,
    setDraft,
    /** Shown only after the first send attempt, so an empty form is not red. */
    issues: checked ? issues : [],
    storageError,
    command,
    locked: command.busy || command.unknown,
    serverMessage: (key: string) => command.error?.fieldErrors?.[`proposedChanges.${key}`]?.[0],
    submit: async () => {
      setChecked(true);
      if (issues.length > 0 || command.busy) return;
      await command.submit(toCorrectionRequest(capabilities.fields, draft));
    },
  };
}
