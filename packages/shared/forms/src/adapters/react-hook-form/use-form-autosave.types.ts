export type FormAutosaveOptions<TIn, TDraft> = {
  /** The part of the raw input the draft keeps. JSON-equal to the last save ⇒ nothing is saved. */
  readonly select: (values: TIn) => TDraft;
  readonly save: (draft: TDraft) => void;
  /** Quiet time before a save; default `FORM_AUTOSAVE_DELAY_MS`. */
  readonly delayMs?: number;
  /** False while the input is frozen (e.g. a create whose result is unknown): edits are not saved then. */
  readonly enabled?: boolean;
};

export type FormAutosave = {
  /** Saves pending input now, e.g. right before a transition the unmount flush would come too late for. */
  readonly flush: () => void;
};
