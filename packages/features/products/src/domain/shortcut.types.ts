export type ShortcutItem = {
  readonly storeProductId: string;
  readonly title: string;
  readonly code: string;
  readonly showInQuickPick: boolean;
  readonly sortOrder: number | null;
  readonly isEligible: boolean;
};
export type ShortcutConfiguration = { readonly version: string; readonly items: readonly ShortcutItem[] };
export type ShortcutDraft = ShortcutConfiguration & {
  readonly schemaVersion: 1;
  readonly code: string;
  readonly productId: string;
  readonly query: string;
  readonly pending?: ShortcutConfiguration;
};
