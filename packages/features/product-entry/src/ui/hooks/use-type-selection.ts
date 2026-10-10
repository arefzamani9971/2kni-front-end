'use client';
import { useEffect, useRef, useState } from 'react';
import { useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { appError, isAppError, type AppError } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import { reconcileAttributeValues } from '../../domain/attribute-values';
import type { AttributeEditorValues } from '../../domain/attribute-values.types';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './entry-keys';
export function useTypeSelection(
  current: Dto<'ProductTypeDto'> | undefined,
  values: AttributeEditorValues,
  onSelect: (type: Dto<'ProductTypeDto'>, values: AttributeEditorValues) => void,
) {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const [pending, setPending] = useState<{
    type: Dto<'ProductTypeDto'>;
    kept: AttributeEditorValues;
    removed: readonly string[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const request = useRef<AbortController | null>(null);
  const target = useRef<string | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function select(id: string) {
    target.current = id;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(null);
    setBusy(true);
    setError(null);
    try {
      const next = await catalog.productType(store.id, id, controller.signal);
      if (controller.signal.aborted) return;
      const reconciled = reconcileAttributeValues(current?.attributes ?? [], next.attributes, values);
      cache.set(entryKeys(store.id).custom('type', id), next);
      if (reconciled.removed.length)
        setPending({ type: next, kept: reconciled.kept, removed: reconciled.removed });
      else onSelect(next, reconciled.kept);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(isAppError(cause) ? cause : appError('Bug', 'UNEXPECTED', '', { messageSource: 'fallback' }));
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  return {
    select,
    retry: () => {
      if (target.current) void select(target.current);
    },
    busy,
    error,
    removedNames:
      pending?.removed.map((id) => current?.attributes.find((a) => a.attributeId === id)?.name ?? id) ?? [],
    pending: !!pending,
    cancel: () => setPending(null),
    confirm: () => {
      if (pending) {
        onSelect(pending.type, pending.kept);
        setPending(null);
      }
    },
  };
}
