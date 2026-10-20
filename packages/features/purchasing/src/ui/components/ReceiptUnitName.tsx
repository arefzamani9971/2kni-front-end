'use client';
import type { Dto } from '@dukani/contracts';
import type { ReactNode } from 'react';
import type { ReceiptAppForm } from './ReceiptForm.types';

/** Leaf that follows the chosen entry unit, so labels like «تعداد جعبه» update without re-rendering the form. */
export function ReceiptUnitName({
  form,
  product,
  children,
}: {
  form: ReceiptAppForm;
  product: Dto<'StoreProductDto'>;
  children: (unitName: string | null) => ReactNode;
}) {
  return (
    <form.Value name="unitId">
      {(unitId) => children(product.units.find((u) => u.id === unitId)?.name ?? null)}
    </form.Value>
  );
}
