/** Applies one change to the latest saved draft; null when the screen is gone and nothing was written. */
export type LocalDraftSave<T> = (update: (draft: T) => T) => Promise<T | null>;
