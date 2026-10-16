import type { AppError } from '@dukani/domain';

/** State of one confirmed command (delete, archive, void…) for a `ConfirmDialog` (PAT-DELETE-01). */
export type ConfirmAction<T> = {
  /** Opens the dialog for this target (the row to delete, the document to void). */
  readonly open: (target: T) => void;
  /** Target of the open dialog, for its title («حذف تأمین‌کنندهٔ پخش مهر؟»). */
  readonly target: T | undefined;
  /** Failure of the last attempt; the dialog stays open so the user can retry or choose another action. */
  readonly error: AppError | null;
  /** Spread onto `ConfirmDialog`: open state, busy state and the confirm handler. */
  readonly dialog: {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly loading: boolean;
    readonly onConfirm: () => void;
  };
};
