'use client';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoresScreen } from '@dukani/store';

export default function StoresPage() {
  const nav = useNavigation();
  return <StoresScreen storeHref={sellerRoutes.store.home} onCreate={() => nav.push(sellerRoutes.newStore())} />;
}
