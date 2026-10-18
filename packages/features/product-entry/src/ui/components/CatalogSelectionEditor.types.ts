import type { Dto } from '@dukani/contracts';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { EntrySelection } from '../../domain/entry-selection.types';
import type { selectionSchema } from './CatalogSelectionEditor.schema';
import type { SelectionShellProps } from './SelectionShell.types';

type SelectionSchema = ReturnType<typeof selectionSchema>;
/** The name and note form, shared by the editor and its fields. */
export type SelectionAppForm = AppForm<InferInput<SelectionSchema>, Infer<SelectionSchema>>;

export type CatalogSelectionEditorProps = {
  readonly item: Dto<'CatalogItemDto'>;
  /** The store product chosen from the store's own results, if any (read once it arrives). */
  readonly product: Dto<'StoreProductDto'> | undefined;
  readonly productId: string | undefined;
  /** The saved name and note the form starts from, and how a change is persisted. */
  readonly draft: {
    readonly initial: EntrySelection;
    readonly save: (value: EntrySelection) => Promise<boolean>;
    readonly failed: boolean;
  };
  readonly bulk: boolean;
  readonly shell: SelectionShellProps;
};
