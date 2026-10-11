import type { Dto } from '@dukani/contracts';
import type { BadgeProps } from '@dukani/ui-kit';

/** Badge tone per correction status; the status itself is translated, never inferred from server text (F11 §9A). */
export const CORRECTION_TONE: Record<Dto<'CorrectionStatus'>, NonNullable<BadgeProps['tone']>> = {
  Draft: 'neutral',
  Submitted: 'info',
  Reviewing: 'info',
  NeedInfo: 'warning',
  Accepted: 'success',
  Rejected: 'danger',
  Appealed: 'info',
  Withdrawn: 'neutral',
};
