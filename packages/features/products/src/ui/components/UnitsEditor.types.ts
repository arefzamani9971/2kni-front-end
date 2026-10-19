/** Which part of the units scene is shown; kept in the editor, so a viewport change keeps it. */
export type UnitsScene =
  { readonly kind: 'list' } | { readonly kind: 'add' } | { readonly kind: 'edit'; readonly unitId: string };
