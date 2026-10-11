export type FlowEventName =
  'screen_view' | 'draft_saved' | 'validation_failed' | 'submit_started' | 'submit_result' | 'recovery_used';
export type FlowEvent = {
  readonly eventName: FlowEventName;
  readonly flowId: 'F09' | 'F10' | 'F17';
  readonly durationMs?: number;
  readonly outcome?: 'success' | 'failed' | 'unknown';
  readonly errorCode?: string;
};
export type FlowAnalytics = { track(event: FlowEvent): void };
/** Allowlist at the sink boundary; never forwards form text, IDs, files, phone numbers or arbitrary props. */
export function sanitizeFlowEvent(event: FlowEvent): FlowEvent {
  return {
    eventName: event.eventName,
    flowId: event.flowId,
    ...(event.durationMs !== undefined && Number.isFinite(event.durationMs)
      ? { durationMs: Math.max(0, Math.min(86_400_000, Math.round(event.durationMs))) }
      : {}),
    ...(event.outcome ? { outcome: event.outcome } : {}),
    ...(event.errorCode && /^[A-Z][A-Z0-9_]{0,63}$/.test(event.errorCode)
      ? { errorCode: event.errorCode }
      : {}),
  };
}
/** Observable local events only. Transport and retention await the canonical product contract. */
export const browserFlowAnalytics: FlowAnalytics = {
  track(event) {
    if (typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent('dukani:flow-analytics', { detail: sanitizeFlowEvent(event) }));
  },
};
