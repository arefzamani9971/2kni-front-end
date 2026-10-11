import type { Dto } from '@dukani/contracts';
import type { AppError } from '@dukani/domain';
import type { LocalConflictField } from '../../domain/local-info.types';

export type LocalEditState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'saving' }
  | { readonly kind: 'saved'; readonly product: Dto<'StoreProductDto'> }
  /** Someone saved first: the fresh product and the fields that now differ from the form. */
  | {
      readonly kind: 'conflict';
      readonly fresh: Dto<'StoreProductDto'>;
      readonly fields: readonly LocalConflictField[];
    }
  /** The response was lost and the server does not show the change: nothing is known to be saved. */
  | { readonly kind: 'unknown' }
  | { readonly kind: 'failed'; readonly error: AppError };
