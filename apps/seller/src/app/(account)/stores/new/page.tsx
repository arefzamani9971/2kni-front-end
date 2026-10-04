'use client';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { CreateStoreScreen } from '@dukani/store';

/** STORE-01 → STORE-SUCCESS (F02); the result offers the first product, the store info or the panel. */
export default function NewStorePage() {
  const nav = useNavigation();
  return (
    <CreateStoreScreen
      onBack={() => nav.replace(sellerRoutes.stores())}
      onExit={(store, to) =>
        nav.replace(
          to === 'first-product'
            ? sellerRoutes.entry.method(store.id)
            : to === 'complete-info'
              ? sellerRoutes.settings.store(store.id)
              : sellerRoutes.store.home(store.id),
        )
      }
    />
  );
}
