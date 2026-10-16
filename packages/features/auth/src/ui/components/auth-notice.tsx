import type { AuthAlert } from '../hooks/use-login-flow.types';
import { RetryWait } from './RetryWait';

/** `AuthShell` notice of an alert: while the server wait runs, its text is the ticking `RetryWait` leaf. */
export const authNotice = (alert: AuthAlert | null) =>
  alert
    ? {
        title: alert.title,
        description:
          alert.waitUntil !== null ? (
            <RetryWait key={alert.waitUntil} until={alert.waitUntil} />
          ) : (
            alert.description
          ),
      }
    : undefined;
