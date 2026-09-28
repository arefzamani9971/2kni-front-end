import type { ReactNode } from 'react';
import type { AppBarProps } from '../patterns/AppBar';
import { FlowShell } from './FlowShell';
import type { ShellCommonProps } from './shell-props';

/** Sign-in and account screens: no navigation before login (F01). */
export function AuthShell(props: ShellCommonProps & { title: ReactNode; back?: AppBarProps['back'] }) {
  return <FlowShell appBar={{ title: props.title, back: props.back }} {...props} />;
}
