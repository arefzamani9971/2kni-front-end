import type { FieldValues } from 'react-hook-form';
import type { z } from 'zod';

export type AnySchema = z.ZodType<unknown, FieldValues>;

export type UseAppFormOptions<S extends AnySchema> = {
  readonly schema: S;
  readonly defaultValues: z.input<S>;
  /** Validate from the first change (default, ui-guidelines 2.4.1) or only on submit. */
  readonly validateOn?: 'change' | 'submit';
  /** Revalidate existing schema errors when presentation context changes; preserve manual/server errors. */
  readonly validationKey?: string;
};
