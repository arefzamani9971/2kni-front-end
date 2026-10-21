/** The last barcode outcome the identification area explains; an identified product needs no note. */
export type IdentificationNote =
  | { readonly kind: 'missing'; readonly code: string }
  | { readonly kind: 'ambiguous'; readonly code: string }
  | null;
