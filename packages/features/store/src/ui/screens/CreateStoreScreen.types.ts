import type { StoreProfile } from '../../application/ports';
import type { SetupExit } from '../components/StoreSetupResult.types';

export type CreateStoreScreenProps = {
  readonly onBack: () => void;
  /** Leaves STORE-SUCCESS for the first product, the store home or the store info (core-user-flows F02 step 4). */
  readonly onExit: (store: StoreProfile, to: SetupExit) => void;
};

/** Views of the one setup route; the optional steps live inside the pending draft (F02 §8). */
export type SetupView = 'setup' | 'type' | 'contact' | 'location' | 'hours' | 'private';
