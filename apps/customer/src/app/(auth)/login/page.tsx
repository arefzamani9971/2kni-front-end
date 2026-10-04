'use client';
import { LoginScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';

/** Customer AUTH-01 (Figma 20b 310:379 / 20 310:3): texts and layout come from the auth module (`cards`). */
export default function LoginPage() {
  const nav = useNavigation();
  const next = useSearchParams().get('next') ?? undefined;
  return <LoginScreen onCodeSent={() => nav.push(customerRoutes.otp(next))} />;
}
