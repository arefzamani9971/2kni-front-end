'use client';
import { useSearchParams } from 'next/navigation';
import { Catalog } from '../../../../widgets/Catalog';
export default function Page() {
  const params = useSearchParams();
  return (
    <Catalog
      initialQuery={params.get('q') ?? ''}
      initialTypeId={params.get('productTypeId') ?? ''}
      initialView={{
        page: params.get('page') ?? undefined,
        size: params.get('size') ?? undefined,
        sort: params.get('sort') ?? undefined,
      }}
    />
  );
}
