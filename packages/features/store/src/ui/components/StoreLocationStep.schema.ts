import { rules, s } from '@dukani/forms';

/** storelocation (594:6736): the typed address is optional; the point is validated by LocationField. */
export const schema = s.object({ addressLine: rules.optionalText('نشانی', 400) });
