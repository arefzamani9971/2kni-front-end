'use client';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { CreateStoreScreen } from '@dukani/store';
import { useToast } from '@dukani/ui-kit';

export default function NewStorePage() {
  const nav = useNavigation();
  const toast = useToast();
  return (
    <CreateStoreScreen
      onBack={() => nav.replace(sellerRoutes.stores())}
      onCreated={(store) => {
        toast(`فروشگاه «${store.name}» ساخته شد.`, 'success');
        nav.replace(sellerRoutes.store.home(store.id));
      }}
    />
  );
}
