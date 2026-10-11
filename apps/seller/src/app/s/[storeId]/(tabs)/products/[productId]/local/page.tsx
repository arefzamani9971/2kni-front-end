'use client';
import { ProductLocalScreen } from '@dukani/products';
import { useParams } from 'next/navigation';

export default function ProductLocalPage() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductLocalScreen key={productId} productId={productId} />;
}
