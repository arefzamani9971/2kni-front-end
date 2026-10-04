'use client';
import { NotReleasedScreen } from '../../../../../widgets/NotReleasedScreen';

/** Settings destinations whose module is not built yet (staff, scan, sessions…): a page state, not a 404. */
export default function SettingsLaterPage() {
  return <NotReleasedScreen />;
}
