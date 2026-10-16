export type SelectionCheckboxProps = {
  /** `mixed` renders the indeterminate state of a header that covers a partly selected group. */
  readonly checked: boolean | 'mixed';
  readonly onChange: (checked: boolean) => void;
  /** Accessible name, e.g. «انتخاب خودکار آبی»; the checkbox has no visible label of its own. */
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
};
