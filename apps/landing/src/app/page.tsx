import { LandingPage } from '@dukani/marketing';
import { customer, seller } from './page.constants';

export default function Home() {
  return <LandingPage links={{ sellerLogin: `${seller}/login`, customerLogin: `${customer}/login` }} />;
}
