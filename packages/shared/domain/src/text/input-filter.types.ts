export type InputFilterKind =
  | 'any'
  | 'digits'
  | 'decimal'
  | 'letters'
  | 'persian-letters'
  | 'persian'
  | 'latin-letters'
  | 'latin'
  | 'alphanumeric'
  | 'persian-alphanumeric'
  | 'email';

/** A custom filter brings its own already-translated message; built-in kinds are worded by the field (`filters.*`). */
export type InputFilter = InputFilterKind | { readonly pattern: RegExp; readonly message: string };

export type FilterCheck = { readonly accepted: boolean };
