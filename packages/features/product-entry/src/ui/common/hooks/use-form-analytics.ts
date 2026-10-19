'use client';
import { useEffect } from 'react';
import type { AppFormState } from '@dukani/forms';
import { useProductEntryModule } from '../../../module';
export function useFormAnalytics(state: AppFormState) {
  const { analytics } = useProductEntryModule();
  useEffect(() => {
    if (state.submitCount > 0 && !state.isValid)
      analytics.track({ eventName: 'validation_failed', flowId: 'F10', errorCode: 'VALIDATION_FAILED' });
  }, [state.submitCount, state.isValid, analytics]);
}
