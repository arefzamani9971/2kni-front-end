import type { AppError } from '@dukani/domain';
import type { CatalogPort } from '../../application/catalog-port.types';

export type LiveCommandOutcomeProps<T extends { readonly name: string }> = {
  readonly kind: string;
  /** Server duplicate code that turns on the «use the existing one» offer. */
  readonly code: string;
  /** The name and its uniqueness scope as the form shows them now (read by `form.Value` leaves). */
  readonly name: string;
  readonly scope: string | null;
  readonly load: (
    port: CatalogPort,
    storeId: string,
    name: string,
    signal: AbortSignal,
  ) => Promise<readonly T[]>;
  readonly scopeOf: (row: T) => string | null;
  readonly unknown: boolean;
  readonly error: AppError | null;
  readonly onRetry: () => void;
  readonly onUseDuplicate: (duplicate: T) => void;
};
