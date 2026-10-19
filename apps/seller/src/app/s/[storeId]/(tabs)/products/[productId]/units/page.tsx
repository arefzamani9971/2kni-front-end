'use client';
import { ProductUnitsScreen } from '@dukani/products';
import { useParams } from 'next/navigation';

export default function ProductUnitsPage() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductUnitsScreen key={productId} productId={productId} />;
}
