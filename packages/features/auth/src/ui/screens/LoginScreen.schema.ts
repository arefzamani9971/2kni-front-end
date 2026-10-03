import { rules, s } from '@dukani/forms';

export const schema = s.object({ mobile: rules.iranMobile() });
