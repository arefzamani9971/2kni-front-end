'use client';
import { isAppError, newOperationId, type AppError, type OperationId, type SubmitState } from '@dukani/domain';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useInvalidate } from './adapters/tanstack';
import type { QueryKey } from './types';

export type FinalCommandOptions<V, R> = {
  /** Sends the command with the operation id as `Idempotency-Key`. */
  readonly run: (variables: V, operationId: OperationId) => Promise<R>;
  readonly onSuccess?: (result: R, variables: V) => void | Promise<void>;
  readonly invalidates?: readonly QueryKey[];
  /** Operation id persisted with a draft (refresh-safe); a new one is generated when absent. */
  readonly operationId?: OperationId | null;
};

export type FinalCommand<V, R> = {
  readonly state: SubmitState<R>;
  readonly busy: boolean;
  /** Starts the action; an action whose result was unknown reuses its operation id. */
  readonly submit: (variables: V) => Promise<R | undefined>;
  /** Re-sends the same operation (the server replays the stored result). */
  readonly retry: () => Promise<R | undefined>;
  readonly reset: () => void;
};

const isLostResponse = (e: AppError) => e.kind === 'Unknown' || (e.kind === 'Conflict' && e.code === 'OPERATION_IN_PROGRESS');
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Final (money/stock) command with one operation id per user action (F28, P11):
 * - lost response (timeout/network after send) → one silent replay with the SAME id, then state `unknown`;
 * - the user can "check again" (`retry`), never creating a second record;
 * - a new action after success/failure gets a new id.
 */
export function useFinalCommand<V, R>(options: FinalCommandOptions<V, R>): FinalCommand<V, R> {
  const [state, setState] = useState<SubmitState<R>>({ kind: 'idle' });
  const pending = useRef<{ id: OperationId; variables: V } | null>(null);
  const invalidate = useInvalidate();
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });

  const send = useCallback(
    async (variables: V, id: OperationId, replay: boolean): Promise<R | undefined> => {
      for (let attempt = replay ? 1 : 0; attempt < 2; attempt++) {
        setState({ kind: attempt === 0 ? 'submitting' : 'querying', operationId: id });
        try {
          const result = await latest.current.run(variables, id);
          pending.current = null;
          setState({ kind: 'succeeded', result });
          await Promise.all((latest.current.invalidates ?? []).map((k) => invalidate(k)));
          await latest.current.onSuccess?.(result, variables);
          return result;
        } catch (e) {
          const error: AppError = isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: String(e) };
          if (!isLostResponse(error)) {
            pending.current = null;
            setState({ kind: 'failed', error });
            return undefined;
          }
          if (attempt === 0) await pause(1500);
        }
      }
      setState({ kind: 'unknown', operationId: id });
      return undefined;
    },
    [invalidate],
  );

  const submit = useCallback(
    (variables: V) => {
      const id = pending.current?.id ?? latest.current.operationId ?? newOperationId();
      pending.current = { id, variables: pending.current?.variables ?? variables };
      return send(pending.current.variables, id, false);
    },
    [send],
  );

  const retry = useCallback(async () => (pending.current ? send(pending.current.variables, pending.current.id, true) : undefined), [send]);
  const reset = useCallback(() => {
    pending.current = null;
    setState({ kind: 'idle' });
  }, []);

  return { state, busy: state.kind === 'submitting' || state.kind === 'querying', submit, retry, reset };
}
