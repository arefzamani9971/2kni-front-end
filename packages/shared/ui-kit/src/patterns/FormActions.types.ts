import type { ReactNode } from 'react';

export type FormActionsProps = {
  /** Primary submit label («ثبت کالا»، «ذخیرهٔ تغییرات»). */
  readonly submitLabel: string;
  /** While the command runs: the Primary keeps its width and shows a spinner; nothing submits twice. */
  readonly busy?: boolean;
  /** Secondary «انصراف/بازگشت»; omitted when there is nowhere to go back to. */
  readonly onCancel?: () => void;
  readonly cancelLabel?: string;
  /** Pinned to the bottom above the safe area and the keyboard (long forms, mobile). Default false. */
  readonly sticky?: boolean;
  /** Avoid: an enabled Primary that shows field errors is clearer. If used, `hint` must say why. */
  readonly disabled?: boolean;
  /** Short reason or note shown above the buttons. */
  readonly hint?: ReactNode;
  /** Further secondary actions, after cancel. */
  readonly extra?: ReactNode;
  /** `form` attribute when the bar sits outside the `<form>` element. */
  readonly formId?: string;
};
