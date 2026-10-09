import { rules, s, type ValidationRules } from '@dukani/forms';

export const schema = (validationRules: ValidationRules = rules) =>
  s.object({ code: validationRules.barcode() });
