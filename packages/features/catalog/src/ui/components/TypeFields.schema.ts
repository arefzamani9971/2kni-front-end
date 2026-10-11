import { s, type ValidationRules } from '@dukani/forms';
import type { CatalogTexts } from '../i18n/types';

/** Product type form: name, optional group, required default base unit (packages are validated separately). */
export const typeSchema = (t: CatalogTexts, rules: ValidationRules) =>
  s.object({
    name: rules.requiredText(t('name'), 120),
    categoryId: s.string(),
    defaultBaseUnitId: rules.required(t('baseUnit')),
  });
