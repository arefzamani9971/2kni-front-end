import type { VerifiedSession } from '../../application/ports';
import type { OtpProblem } from '../../domain/otp-challenge.types';

export type Problem = { readonly kind: OtpProblem; readonly message?: string };

export type OtpScreenProps = {
  readonly onSignedIn: (result: VerifiedSession) => void;
  readonly onChangeNumber: () => void;
  /** No pending challenge (direct visit or expired tab): usually back to the login page. */
  readonly onMissingChallenge: () => void;
};
