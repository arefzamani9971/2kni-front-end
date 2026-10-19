'use client';
import { useEffect } from 'react';
import type { SubmitState } from '@dukani/domain';
import type { FlowEvent } from '@dukani/platform';
import { useProductEntryModule } from '../../module';

/**
 * The outcomes of a final command that only its state knows: a refusal (with its code) and an unknown result. Both
 * are terminal states, so each is seen once. Starts and answers are reported by `timedSubmit` around the command's
 * `run`. `recoveryUsed` reports «بررسی دوباره».
 */
export function useSubmitTelemetry(flowId: FlowEvent['flowId'], state: SubmitState<unknown>) {
  const { analytics } = useProductEntryModule();
  useEffect(() => {
    if (state.kind === 'failed')
      analytics.track({ eventName: 'submit_result', flowId, outcome: 'failed', errorCode: state.error.code });
    else if (state.kind === 'unknown')
      analytics.track({ eventName: 'submit_result', flowId, outcome: 'unknown' });
  }, [state, analytics, flowId]);
  return { recoveryUsed: () => analytics.track({ eventName: 'recovery_used', flowId }) };
}
