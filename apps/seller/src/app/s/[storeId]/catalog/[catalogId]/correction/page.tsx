'use client';
import { CorrectionScreen } from '@dukani/catalog';
import { ProductDetailScreen } from '@dukani/products';
import { useParams, useSearchParams } from 'next/navigation';

/** Desktop shows the correction dialog over the product it was opened from (Figma 312:763 pattern). */
export default function CatalogCorrectionPage() {
  const { catalogId } = useParams<{ catalogId: string }>();
  const productId = useSearchParams().get('productId');
  return (
    <CorrectionScreen
      key={catalogId}
      itemId={catalogId}
      background={productId ? <ProductDetailScreen productId={productId} /> : undefined}
    />
  );
}
