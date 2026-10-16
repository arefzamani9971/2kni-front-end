export type FilterChipItem = {
  readonly key: string;
  /** Applied value as the user reads it, e.g. «دسته: نوشت‌افزار». */
  readonly label: string;
};

export type ActiveFilterChipsProps = {
  readonly items: readonly FilterChipItem[];
  readonly onRemove: (key: string) => void;
  /** Offered when more than one filter is applied. */
  readonly onClearAll?: () => void;
};
