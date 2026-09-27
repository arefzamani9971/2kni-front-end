'use client';
import { ProductDetailScreen } from '@dukani/products';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductDetailScreen key={productId} productId={productId} />;
}
