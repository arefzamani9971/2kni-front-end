'use client';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoreInfoScreen } from '@dukani/store';

/** STORE-04 «اطلاعات و تنظیمات» (F03). */
export default function StoreInfoPage() {
  const { id } = useActiveStore();
  return (
    <StoreInfoScreen
      storeId={id}
      qrHref={sellerRoutes.settings.storeQr(id)}
      editHref={sellerRoutes.settings.storeEdit(id)}
      contactHref={sellerRoutes.settings.storeContact(id)}
      privateHref={sellerRoutes.settings.storePrivate(id)}
    />
  );
}
