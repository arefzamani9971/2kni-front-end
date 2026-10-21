import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { schemaFor } from '../schemas/LineEditor.schema';

type LineSchema = ReturnType<typeof schemaFor>;
/** The purchase line form, shared by the editor and its live summary leaf. */
export type LineAppForm = AppForm<InferInput<LineSchema>, Infer<LineSchema>>;
