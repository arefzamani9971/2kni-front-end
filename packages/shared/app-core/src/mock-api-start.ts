let started: Promise<unknown> | null = null;

/** Starts the MSW mock backend once per page, however many boundaries mount. */
export const startMockApiOnce = (): Promise<unknown> =>
  (started ??= import('@dukani/testing/browser').then((m) => m.startMockApi()));
