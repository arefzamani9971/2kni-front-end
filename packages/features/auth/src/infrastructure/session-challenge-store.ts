import type { KeyValueStorage } from '@dukani/platform';
import type { ChallengeStore } from '../application/ports';
import type { OtpChallenge } from '../domain/otp-challenge.types';
import { KEY, MOBILE_KEY } from './session-challenge-store.constants';

export const createChallengeStore = (storage: KeyValueStorage): ChallengeStore => ({
  save: (c) => {
    storage.set(KEY, c);
    storage.set(MOBILE_KEY, c.mobile);
  },
  load: () => storage.get<OtpChallenge>(KEY),
  discard: () => storage.remove(KEY),
  lastMobile: () => storage.get<string>(MOBILE_KEY),
  clear: () => {
    storage.remove(KEY);
    storage.remove(MOBILE_KEY);
  },
});
