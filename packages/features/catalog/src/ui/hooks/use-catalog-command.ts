'use client';
import { useEffect, useState } from 'react';
import { useAppQuery, useFinalCommand, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { OperationId } from '@dukani/domain';
import { createOperationIntent } from '../../application/operation-intent';
import { useCatalogModule } from '../../module';
export function useCatalogCommand<V, R>(
  id: string,
  run: (variables: V, operationId: OperationId) => Promise<R>,
  onSuccess: (result: R) => void,
) {
  const store = useActiveStore();
  const { journal } = useCatalogModule();
  const cache = useQueryCache();
  const key = ['catalog-intent', store.id, id] as const;
  const recovery = useAppQuery({
    queryKey: key,
    queryFn: () => journal.read<V>(store.id, id),
    staleTime: Infinity,
  });
  const [prepare] = useState(() => createOperationIntent(journal, store.id, id));
  const [resolved, setResolved] = useState(false);
  const command = useFinalCommand<V, R>({
    operationId: resolved ? undefined : recovery.data?.operationId,
    async run(variables, operationId) {
      await prepare(variables, operationId, recovery.data?.operationId === operationId);
      cache.set(key, { schemaVersion: 1, operationId, payload: variables });
      return run(variables, operationId);
    },
    async onSuccess(result) {
      setResolved(true);
      cache.set(key, null);
      try {
        await journal.remove(store.id, id);
      } finally {
        onSuccess(result);
      }
    },
    invalidates: [
      ['catalog', store.id],
      ['entry', store.id],
    ],
  });
  useEffect(() => {
    if (command.state.kind !== 'failed') return;
    const clear = () => {
      cache.set(['catalog-intent', store.id, id], null);
      setResolved(true);
    };
    void journal.remove(store.id, id).then(clear, clear);
  }, [command.state.kind, journal, store.id, id, cache]);
  const restored = !resolved && !!recovery.data;
  return {
    ...command,
    loading: recovery.isPending,
    unknown: command.state.kind === 'unknown' || (restored && !command.busy && command.state.kind === 'idle'),
    error: recovery.error ?? (command.state.kind === 'failed' ? command.state.error : null),
    async submit(variables: V) {
      if (recovery.isPending || recovery.error) return undefined;
      return command.submit(restored ? recovery.data!.payload : variables);
    },
    retry: () => (restored ? command.submit(recovery.data!.payload) : command.retry()),
  };
}
