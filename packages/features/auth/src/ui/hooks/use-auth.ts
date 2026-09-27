'use client';
import { useAppMutation } from '@dukani/data';
import type { VerifiedSession } from '../../application/ports';
import type { OtpChallenge } from '../../domain/otp-challenge';
import { useAuthModule } from '../../module';

/** AUTH-01: sends the code and remembers the challenge for the OTP page. */
export const useRequestOtp = () => {
  const { gateway, challenges } = useAuthModule();
  return useAppMutation<OtpChallenge, string>({
    mutationFn: (mobile) => gateway.requestOtp(mobile),
    onSuccess: (challenge) => challenges.save(challenge),
  });
};

/** AUTH-02: verifies the code, starts the session and forgets the challenge. */
export const useVerifyOtp = () => {
  const { gateway, challenges, session } = useAuthModule();
  return useAppMutation<VerifiedSession, { challenge: OtpChallenge; code: string }>({
    mutationFn: async ({ challenge, code }) => {
      const result = await gateway.verifyOtp(challenge, code);
      await session.signIn(result.tokens);
      challenges.clear();
      return result;
    },
  });
};
