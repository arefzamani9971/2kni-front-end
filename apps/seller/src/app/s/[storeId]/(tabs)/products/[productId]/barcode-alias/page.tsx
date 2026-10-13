'use client';
import { useParams } from 'next/navigation';
import { BarcodeAliasScreen } from '@dukani/products';
export default function Page() {
  const { productId } = useParams<{ productId: string }>();
  return <BarcodeAliasScreen productId={productId} />;
}
