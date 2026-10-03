import type { SubmitState } from './submit-state.types';

export const isBusy = (s: SubmitState): boolean => s.kind === 'submitting' || s.kind === 'querying';
