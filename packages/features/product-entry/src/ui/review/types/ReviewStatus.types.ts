import type { EntryDraft } from '../../../domain/entry-draft.types';
import type { useEntryRegistration } from '../hooks/use-entry-registration';
import type { useRegisterPreview } from '../hooks/use-register-preview';
import type { Save } from '../../common/types/use-entry-draft.types';

export type ReviewStatusProps = {
  readonly draft: EntryDraft;
  readonly save: Save;
  readonly preview: ReturnType<typeof useRegisterPreview>;
  readonly register: ReturnType<typeof useEntryRegistration>;
  /** Starting the register or the bulk addition failed before anything was sent. */
  readonly startError: unknown;
};
