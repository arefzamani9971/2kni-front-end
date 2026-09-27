import type { KeyValueStorage } from '@dukani/platform';
import type { ChallengeStore } from '../application/ports';
import type { OtpChallenge } from '../domain/otp-challenge';

const KEY = 'auth.challenge';

export const createChallengeStore = (storage: KeyValueStorage): ChallengeStore => ({
  save: (c) => storage.set(KEY, c),
  load: () => storage.get<OtpChallenge>(KEY),
  clear: () => storage.remove(KEY),
});
