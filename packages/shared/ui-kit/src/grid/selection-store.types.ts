/**
 * Row selection kept outside React state: each row subscribes to its own id, so ticking one row re-renders that
 * row and the header checkbox only, never the whole grid. Ids are stable record ids, independent of page, sort,
 * filter and viewport (PAT-LIST-01 «انتخاب و عملیات گروهی»).
 */
export type SelectionStore = {
  readonly has: (id: string) => boolean;
  readonly size: () => number;
  /** Immutable snapshot; the same object until the selection changes. */
  readonly ids: () => ReadonlySet<string>;
  readonly set: (id: string, selected: boolean) => void;
  readonly toggle: (id: string) => void;
  readonly setMany: (ids: readonly string[], selected: boolean) => void;
  readonly clear: () => void;
  readonly subscribe: (listener: () => void) => () => void;
};

/** Selection state of a group of ids (a page or the loaded cards) for a header checkbox. */
export type GroupSelection = 'all' | 'some' | 'none';
