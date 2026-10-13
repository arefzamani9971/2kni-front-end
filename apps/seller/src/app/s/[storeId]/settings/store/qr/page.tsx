'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoreQrScreen } from '@dukani/store';

export default function StoreQrPage() {
  const { id } = useActiveStore();
  const nav = useNavigation();
  return <StoreQrScreen storeId={id} onBack={() => nav.push(sellerRoutes.settings.store(id))} />;
}
