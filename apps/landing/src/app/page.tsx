import { LandingPage } from '@dukani/marketing';

const seller = process.env.NEXT_PUBLIC_SELLER_URL ?? 'http://localhost:3001';
const customer = process.env.NEXT_PUBLIC_CUSTOMER_URL ?? 'http://localhost:3002';

export default function Home() {
  return <LandingPage links={{ sellerLogin: `${seller}/login`, customerLogin: `${customer}/login` }} />;
}
