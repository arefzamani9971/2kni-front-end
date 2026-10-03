'use client';
import { OtpScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { safeNext, sellerRoutes } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { entryRoute } from '../../../../composition/entry-route';
import { useSeller } from '../../../../composition/use-seller';

export default function OtpPage() {
  const nav = useNavigation();
  const { modules } = useSeller();
  const next = useSearchParams().get('next');
  const toLogin = useCallback(() => nav.replace(sellerRoutes.login(next ?? undefined)), [nav, next]);
  return (
    <OtpScreen
      onChangeNumber={toLogin}
      onMissingChallenge={toLogin}
      // an internal `next` wins (external URLs are discarded); otherwise the default store only if still allowed
      onSignedIn={async ({ tokens }) => {
        const safe = safeNext(next, '');
        nav.replace(safe || (await entryRoute(modules, tokens.user.defaultStoreId)));
      }}
    />
  );
}
