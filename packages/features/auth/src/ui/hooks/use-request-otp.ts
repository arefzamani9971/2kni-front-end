'use client';
import { useAppMutation } from '@dukani/data';
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
