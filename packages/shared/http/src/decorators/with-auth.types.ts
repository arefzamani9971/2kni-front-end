/** What the auth decorator needs from the session (implemented by @dukani/platform session adapters). */
export type TokenProvider = {
  getAccessToken(): string | null;
  /** Single-flight refresh; resolves false when the session cannot be renewed. */
  refresh(): Promise<boolean>;
  onSessionExpired(): void;
};
