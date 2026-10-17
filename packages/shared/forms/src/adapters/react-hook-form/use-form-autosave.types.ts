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
  /**
   * Saves pending input now, e.g. right before a transition (leave dialog, reuse of an existing record). Resolves
   * true once the current input is persisted, false when that write failed — await it before a step that must not
   * lose the draft (opening an in-place creation, leaving the page). Unchanged input is not written again: it
   * resolves the outcome of the latest write, waiting for one in flight; after a failure the next flush writes the
   * same input again. While `enabled` is false nothing is written: input that differs from the draft resolves false.
   */
  readonly flush: () => Promise<boolean>;
  /** Reports a change the form subscription cannot see (rows or choices kept outside the form). */
  readonly schedule: () => void;
};
