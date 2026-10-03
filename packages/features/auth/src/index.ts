/** Auth feature (scope:shared): OTP login for the seller and customer apps. */
export { createAuthModule, AuthModuleProvider, useAuthModule } from './module';
export { type AuthModule, type AuthModuleDeps } from './module.types';
export type { AuthGateway, ChallengeStore, VerifiedSession } from './application/ports';
export type { OtpChallenge } from './domain/otp-challenge.types';
export { LoginScreen } from './ui/screens/LoginScreen';
export { type LoginScreenProps } from './ui/screens/LoginScreen.types';
export { OtpScreen } from './ui/screens/OtpScreen';
export { type OtpScreenProps } from './ui/screens/OtpScreen.types';
