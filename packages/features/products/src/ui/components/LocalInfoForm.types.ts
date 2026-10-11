import type { Dto } from '@dukani/contracts';
import type { AppError } from '@dukani/domain';
import type { ReactNode } from 'react';
import type { LocalInfoValues } from '../../domain/local-info.types';

export type LocalInfoFormProps = {
  product: Dto<'StoreProductDto'>;
  open: boolean;
  busy: boolean;
  /** Save result of the host (conflict, unknown result, failure). */
  banner?: ReactNode;
  /** Resolves with the server error when it carries field errors to show next to the inputs. */
  onSave: (values: LocalInfoValues) => Promise<AppError | null>;
  /** Back from the form; `dirty` lets the host ask before discarding. */
  onBack: (dirty: boolean) => void;
};
