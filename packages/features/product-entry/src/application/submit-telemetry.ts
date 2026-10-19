import type { OperationId } from '@dukani/domain';
import type { FlowAnalytics, FlowEvent } from '@dukani/platform';

/**
 * Wraps a final command's `run` with its telemetry: every attempt (a send, a silent replay or a recovery query)
 * reports `submit_started`, and an answer reports `submit_result` success with that attempt's duration. Reported
 * where the attempt happens, so a fast answer that React renders in one pass still has its start.
 */
export const timedSubmit =
  <V, R>(
    analytics: FlowAnalytics,
    flowId: FlowEvent['flowId'],
    run: (variables: V, operationId: OperationId) => Promise<R>,
  ) =>
  async (variables: V, operationId: OperationId): Promise<R> => {
    const started = performance.now();
    analytics.track({ eventName: 'submit_started', flowId });
    const result = await run(variables, operationId);
    analytics.track({
      eventName: 'submit_result',
      flowId,
      outcome: 'success',
      durationMs: performance.now() - started,
    });
    return result;
  };
