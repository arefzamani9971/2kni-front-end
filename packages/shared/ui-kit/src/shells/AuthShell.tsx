import { AuthShellSplit } from './AuthShellSplit';
import { AuthShellCards } from './AuthShellCards';
import type { AuthShellProps } from './AuthShell.types';

/** Product strategies share semantic content; viewport decisions stay inside each shell. */
export function AuthShell(props: AuthShellProps) {
  return props.layout === 'cards' ? <AuthShellCards {...props} /> : <AuthShellSplit {...props} />;
}
