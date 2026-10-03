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

export type InputFilter = InputFilterKind | { readonly pattern: RegExp; readonly message: string };

export type FilterCheck =
  { readonly accepted: true } | { readonly accepted: false; readonly message: string };
