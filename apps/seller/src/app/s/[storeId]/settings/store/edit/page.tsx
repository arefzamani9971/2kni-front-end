'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoreEditScreen } from '@dukani/store';

/** STORE-05 «ویرایش فروشگاه» of an existing store; done / back returns to STORE-04. */
export default function StoreEditPage() {
  const { id } = useActiveStore();
  const nav = useNavigation();
  return <StoreEditScreen storeId={id} entry="edit" onDone={() => nav.replace(sellerRoutes.settings.store(id))} />;
}
