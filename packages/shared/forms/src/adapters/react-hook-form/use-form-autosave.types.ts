export type FormAutosaveOptions<TIn, TDraft> = {
  /** The part of the input the draft keeps; it may add state from outside the form. JSON-equal ⇒ not saved. */
  readonly select: (values: TIn) => TDraft;
  /** Return false when persistence failed; report the error in the owning session. Writes must be ordered there. */
  readonly save: (draft: TDraft) => void | boolean | Promise<void | boolean>;
  /** Quiet time that ends a burst of edits; default `FORM_AUTOSAVE_DELAY_MS`. */
  readonly delayMs?: number;
  /** False while the input is frozen (e.g. a create whose result is unknown): edits are not saved then. */
  readonly enabled?: boolean;
};

export type FormAutosave = {
  /** Saves pending input now, e.g. right before a transition (leave dialog, reuse of an existing record). */
  readonly flush: () => void;
  /** Reports a change the form subscription cannot see (rows or choices kept outside the form). */
  readonly schedule: () => void;
};
