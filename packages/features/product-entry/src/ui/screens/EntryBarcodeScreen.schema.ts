import { rules, s } from '@dukani/forms';

export const schema = s.object({ code: rules.barcode() });
