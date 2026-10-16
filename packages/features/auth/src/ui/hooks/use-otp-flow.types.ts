import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { AuthLayout } from '@dukani/ui-kit';
import type { OtpChallenge } from '../../domain/otp-challenge.types';
import type { AuthAlert } from './use-login-flow.types';
import type { schema } from '../screens/OtpScreen.schema';
import type { OtpScreenProps, Problem } from '../screens/OtpScreen.types';

/**
 * Which persistent actions the screen offers (Figma states of AUTH-02):
 * `confirm` «تأیید و ورود» · `fix` «اصلاح کد» (otp-wrong) · `new-code` «دریافت کد جدید» (otp-expired, limited
 * after the wait) · `retry-send` «تلاش دوباره» (otp-send-failed) · `change-only` «تغییر شماره» (limited, blocked).
 */
export type OtpActionMode = 'confirm' | 'fix' | 'new-code' | 'retry-send' | 'change-only';

export type OtpFlow = {
  readonly layout: AuthLayout;
  readonly challenge: OtpChallenge;
  readonly form: AppForm<InferInput<ReturnType<typeof schema>>, Infer<ReturnType<typeof schema>>>;
  readonly problem: Problem | null;
  /** States that hide the code field (everything but `wrong` and `other`). */
  readonly blocking: boolean;
  /** Danger alert of the current problem (Figma «Alert / Danger»), null when there is none. */
  readonly alert: AuthAlert | null;
  readonly mode: OtpActionMode;
  /** Mobile in Persian digits. */
  readonly mobile: string;
  readonly devCode: string | null;
  /** Epoch ms when «ارسال دوباره کد» is allowed (the note counts down to it). */
  readonly resendAt: number;
  readonly resendReady: boolean;
  readonly online: boolean;
  readonly verifying: boolean;
  readonly resending: boolean;
  readonly submit: (event?: { preventDefault(): void }) => Promise<void>;
  readonly sendAgain: () => Promise<void>;
  readonly changeNumber: () => void;
  /** Typing after otp-wrong leaves the wrong state. */
  readonly onCodeEdited: () => void;
};

export type UseOtpFlowOptions = Pick<OtpScreenProps, 'onSignedIn' | 'onChangeNumber' | 'onMissingChallenge'>;
