'use client';
import {
  isAppError,
  newOperationId,
  type AppError,
  type OperationId,
  type SubmitState,
} from '@dukani/domain';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useInvalidate } from './adapters/tanstack';
import type { CommandCompletionError, FinalCommand, FinalCommandOptions } from './final-command.types';

const isLostResponse = (e: AppError) =>
  (e.kind === 'Unknown' && e.code !== 'ABORTED') ||
  (e.kind === 'Conflict' && e.code === 'OPERATION_IN_PROGRESS');
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const commandError = (e: unknown): AppError =>
  isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: String(e) };

/**
 * Final (money/stock) command with one operation id per user action (F28, P11):
 * - lost response (timeout/network after send) → one silent replay with the SAME id, then state `unknown`;
 * - the user can "check again" (`retry`), never creating a second record;
 * - a new action after success/failure gets a new id.
 */
export function useFinalCommand<V, R>(options: FinalCommandOptions<V, R>): FinalCommand<V, R> {
  const [state, setState] = useState<SubmitState<R>>({ kind: 'idle' });
  const [completionErrors, setCompletionErrors] = useState<readonly CommandCompletionError[]>([]);
  const [completing, setCompleting] = useState(false);
  const inFlight = useRef<Promise<R | undefined> | null>(null);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const pending = useRef<{ id: OperationId; variables: V } | null>(null);
  const invalidate = useInvalidate();
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });

  const send = useCallback(
    async (variables: V, id: OperationId, replay: boolean): Promise<R | undefined> => {
      const action = latest.current;
      setCompletionErrors([]);
      for (let attempt = replay ? 1 : 0; attempt < 2; attempt++) {
        if (!mounted.current) return undefined;
        setState({ kind: attempt === 0 ? 'submitting' : 'querying', operationId: id });
        let result: R;
        try {
          result = await action.run(variables, id);
        } catch (e) {
          if (!mounted.current) return undefined;
          const error = commandError(e);
          if (error.code === 'ABORTED') {
            // Cancellation does not prove the server rolled back; retain the id for explicit recovery.
            setState({ kind: 'unknown', operationId: id });
            return undefined;
          }
          if (!isLostResponse(error)) {
            pending.current = null;
            setState({ kind: 'failed', error });
            return undefined;
          }
          if (attempt === 0) await pause(1500);
          continue;
        }
        if (!mounted.current) return undefined;
        pending.current = null;
        setState({ kind: 'succeeded', result });
        setCompleting(true);
        const errors: CommandCompletionError[] = [];
        // Local effects must never enter the command retry loop or hide its confirmed result.
        const invalidations = await Promise.allSettled(
          (action.invalidates ?? []).map((key) => Promise.resolve().then(() => invalidate(key))),
        );
        for (const effect of invalidations)
          if (effect.status === 'rejected')
            errors.push({ phase: 'invalidation', error: commandError(effect.reason) });
        if (mounted.current) {
          try {
            await action.onSuccess?.(result, variables);
          } catch (error) {
            errors.push({ phase: 'onSuccess', error: commandError(error) });
          }
        }
        if (mounted.current) {
          setCompletionErrors(errors);
          setCompleting(false);
        }
        return result;
      }
      if (!mounted.current) return undefined;
      setState({ kind: 'unknown', operationId: id });
      return undefined;
    },
    [invalidate],
  );

  const submit = useCallback(
    (variables: V) => {
      if (inFlight.current) return inFlight.current;
      if (!mounted.current) return Promise.resolve(undefined);
      const id = pending.current?.id ?? latest.current.operationId ?? newOperationId();
      pending.current = { id, variables: pending.current?.variables ?? variables };
      const promise = send(pending.current.variables, id, false).finally(() => {
        inFlight.current = null;
      });
      inFlight.current = promise;
      return promise;
    },
    [send],
  );

  const retry = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    if (!pending.current || !mounted.current) return Promise.resolve(undefined);
    const promise = send(pending.current.variables, pending.current.id, true).finally(() => {
      inFlight.current = null;
    });
    inFlight.current = promise;
    return promise;
  }, [send]);
  const reset = useCallback(() => {
    if (inFlight.current) return;
    pending.current = null;
    setCompletionErrors([]);
    setState({ kind: 'idle' });
  }, []);

  return {
    state,
    completionErrors,
    busy: completing || state.kind === 'submitting' || state.kind === 'querying',
    submit,
    retry,
    reset,
  };
}
