export type FilterValues = Readonly<Record<string, unknown>>;

export type FilterDraftOptions<F extends FilterValues> = {
  /** Filter currently applied to the list (`list.query.filter`). */
  readonly applied: F;
  /** Use-case defaults, e.g. `{ q: '', onlyStoreType: true }`; «بازنشانی» returns the draft to these. */
  readonly defaults: F;
  /** Applies a complete filter (`list.applyFilter`). */
  readonly onApply: (filter: F) => void;
};

export type FilterDraft<F extends FilterValues> = {
  /** What the fields show: the applied filter with the user's unapplied edits on top. */
  readonly draft: F;
  readonly set: (changes: Partial<F>) => void;
  /** Draft differs from the applied filter. */
  readonly dirty: boolean;
  readonly apply: () => void;
  /** Draft back to the defaults; nothing is applied until «جست‌وجو». */
  readonly reset: () => void;
  /** Removes one applied filter immediately (chip ×); other unapplied edits are kept. */
  readonly remove: (key: keyof F) => void;
  /** Applies the defaults immediately («پاک کردن همهٔ فیلترها»). */
  readonly clearAll: () => void;
  /** Keys whose applied value differs from the default — the chips to show. */
  readonly activeKeys: readonly (keyof F)[];
};
