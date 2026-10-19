'use client';
import { useState } from 'react';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { Icon } from '@dukani/ui-kit';
import { useProductEntryModule } from '../../../module';
export function CatalogImage({
  itemId,
  fileId,
  title,
}: {
  itemId: string;
  fileId?: string | null;
  title: string;
}) {
  const store = useActiveStore();
  const { catalog } = useProductEntryModule();
  const [failed, setFailed] = useState(false);
  const query = useAppQuery({
    queryKey: ['entry-image', store.id, itemId, fileId],
    enabled: !!fileId,
    staleTime: 5 * 60_000,
    queryFn: ({ signal }) => catalog.imageUrl(store.id, itemId, fileId!, signal),
  });
  return (
    <span className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      {query.data && !failed ? (
        <img
          alt={title}
          src={query.data.url}
          width={48}
          height={48}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon name="products" />
      )}
    </span>
  );
}
