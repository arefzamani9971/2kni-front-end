'use client';
import { OtpScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { safeNext, sellerRoutes } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function OtpPage() {
  const nav = useNavigation();
  const next = useSearchParams().get('next');
  const toLogin = useCallback(() => nav.replace(sellerRoutes.login(next ?? undefined)), [nav, next]);
  return (
    <OtpScreen
      onChangeNumber={toLogin}
      onMissingChallenge={toLogin}
      onSignedIn={({ tokens, isNewUser }) => {
        if (isNewUser) return nav.replace(sellerRoutes.newStore());
        const home = tokens.user.defaultStoreId ? sellerRoutes.store.home(tokens.user.defaultStoreId) : sellerRoutes.stores();
        nav.replace(safeNext(next, home));
      }}
    />
  );
}
