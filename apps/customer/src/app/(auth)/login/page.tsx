'use client';
import { LoginScreen } from '@dukani/auth';
import { useNavigation } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import { useSearchParams } from 'next/navigation';
import { env } from '../../../env';

export default function LoginPage() {
  const nav = useNavigation();
  const next = useSearchParams().get('next') ?? undefined;
  return (
    <LoginScreen
      title="ورود مشتری"
      intro="خریدها، فاکتورها و بدهی‌های شما در فروشگاه‌ها"
      onBack={() => window.location.assign(env.landingUrl)}
      onCodeSent={() => nav.push(customerRoutes.otp(next))}
    />
  );
}
