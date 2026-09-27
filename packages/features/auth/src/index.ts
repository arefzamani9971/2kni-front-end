/** Auth feature (scope:shared): OTP login for the seller and customer apps. */
export { createAuthModule, AuthModuleProvider, useAuthModule, type AuthModule, type AuthModuleDeps } from './module';
export type { AuthGateway, ChallengeStore, VerifiedSession } from './application/ports';
export type { OtpChallenge } from './domain/otp-challenge';
export { LoginScreen, type LoginScreenProps } from './ui/screens/LoginScreen';
export { OtpScreen, type OtpScreenProps } from './ui/screens/OtpScreen';
