'use client';
import { ProductTypeScreen } from '@dukani/catalog';
import { useProductEntryActions } from '@dukani/product-entry';
export function ProductType({ productTypeId }: { productTypeId: string }) {
  const { startNew } = useProductEntryActions();
  return (
    <ProductTypeScreen
      productTypeId={productTypeId}
      onCreate={(type) =>
        startNew({ productType: { id: type.id, name: type.name, baseUnit: type.defaultBaseUnit } })
      }
    />
  );
}
