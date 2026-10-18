/** The frame of «انتخاب کالای کاتالوگ»: the search above the item and the way back to the results. */
export type SelectionShellProps = {
  /** The search text: a draft owned by the screen, so it survives the switch from loading to the item. */
  readonly search: string;
  readonly onSearchChange: (text: string) => void;
  /** Enter in the search: back to the results for the typed text. */
  readonly onSearch: () => void;
  readonly onBack: () => void;
};
