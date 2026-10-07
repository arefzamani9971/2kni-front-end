import type { AppError, OperationId, SubmitState } from '@dukani/domain';
import type { QueryKey } from './types';

export type FinalCommandOptions<V, R> = {
  /** Sends the command with the operation id as `Idempotency-Key`. */
  readonly run: (variables: V, operationId: OperationId) => Promise<R>;
  /** Local follow-up after confirmed success; errors go to completionErrors, never to command retry. */
  readonly onSuccess?: (result: R, variables: V) => void | Promise<void>;
  readonly invalidates?: readonly QueryKey[];
  /** Operation id persisted with a draft (refresh-safe); a new one is generated when absent. */
  readonly operationId?: OperationId | null;
};

export type FinalCommand<V, R> = {
  readonly state: SubmitState<R>;
  /** Includes invalidation and onSuccess; concurrent calls share the in-flight action. */
  readonly busy: boolean;
  /** Local follow-up failures; the server command remains succeeded and must not be replayed. */
  readonly completionErrors: readonly CommandCompletionError[];
  /** Starts the action; an action whose result was unknown reuses its operation id. */
  readonly submit: (variables: V) => Promise<R | undefined>;
  /** Re-sends the same operation (the server replays the stored result). */
  readonly retry: () => Promise<R | undefined>;
  /** Clears completed state; ignored while an action or its local follow-up is in flight. */
  readonly reset: () => void;
};

export type CommandCompletionError = {
  readonly phase: 'invalidation' | 'onSuccess';
  readonly error: AppError;
};
