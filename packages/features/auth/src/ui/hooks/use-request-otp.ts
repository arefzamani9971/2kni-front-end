'use client';
import { useAppMutation } from '@dukani/data';
import { assertSupportedChallenge } from '../../domain/otp-challenge';
import type { OtpChallenge } from '../../domain/otp-challenge.types';
import { useAuthModule } from '../../module';

/** AUTH-01: sends the code and remembers the challenge for the OTP page. */
export const useRequestOtp = () => {
  const { gateway, challenges } = useAuthModule();
  return useAppMutation<OtpChallenge, string>({
    mutationFn: async (mobile) => assertSupportedChallenge(await gateway.requestOtp(mobile)),
    onSuccess: (challenge) => challenges.save(challenge),
  });
};
