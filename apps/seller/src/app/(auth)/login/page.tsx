'use client';
import { LoginScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';
import { env } from '../../../env';

export default function LoginPage() {
  const nav = useNavigation();
  const next = useSearchParams().get('next') ?? undefined;
  return <LoginScreen onBack={() => window.location.assign(env.landingUrl)} onCodeSent={() => nav.push(sellerRoutes.otp(next))} />;
}
