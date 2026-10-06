/** What the auth decorator needs from the session (implemented by @dukani/platform session adapters). */
export type TokenProvider = {
  getAccessToken(): string | null;
  /** Optional for non-session token providers; fences requests across identity changes. */
  getSessionVersion?(): number;
  getSessionSignal?(): AbortSignal;
  /** False only for definitive rejection; temporary failures reject without ending the session. */
  refresh(): Promise<boolean>;
  onSessionExpired(): void;
};
