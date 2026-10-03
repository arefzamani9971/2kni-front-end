import type { OperationId, SubmitState } from '@dukani/domain';
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
