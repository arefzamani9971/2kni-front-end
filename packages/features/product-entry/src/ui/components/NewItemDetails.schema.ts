import { rules, s } from '@dukani/forms';

export const schema = s.object({
  title: rules.requiredText('نام کامل کالا', 160),
  productTypeId: rules.required('نوع کالا'),
  brand: rules.required('برند'),
  baseUnitId: rules.required('واحد پایهٔ فروش'),
  barcode: rules.optional.barcode(),
});
