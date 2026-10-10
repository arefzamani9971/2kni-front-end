'use client';
import { useParams } from 'next/navigation';
import { ProductType } from '../../../../../../widgets/ProductType';
export default function Page() {
  const { productTypeId } = useParams<{ productTypeId: string }>();
  return <ProductType productTypeId={productTypeId} />;
}
