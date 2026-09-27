'use client';
import { OtpScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { customerRoutes, safeNext } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function OtpPage() {
  const nav = useNavigation();
  const next = useSearchParams().get('next');
  const toLogin = useCallback(() => nav.replace(customerRoutes.login(next ?? undefined)), [nav, next]);
  return <OtpScreen onChangeNumber={toLogin} onMissingChallenge={toLogin} onSignedIn={() => nav.replace(safeNext(next, customerRoutes.home()))} />;
}
