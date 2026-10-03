import type { FieldPathValue } from '../../types';

export type ArrayItem<TIn, P extends string> =
  FieldPathValue<TIn, P> extends readonly (infer U)[] ? U : never;
