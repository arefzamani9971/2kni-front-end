import type { AppError } from './app-error.types';
import type { OperationId } from './ids.types';

/** State of a final (money/stock) command guarded by an operation id (F28, P11). */
export type SubmitState<R = unknown> =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting'; readonly operationId: OperationId }
  | { readonly kind: 'succeeded'; readonly result: R }
  | { readonly kind: 'failed'; readonly error: AppError }
  | { readonly kind: 'unknown'; readonly operationId: OperationId }
  | { readonly kind: 'querying'; readonly operationId: OperationId };
