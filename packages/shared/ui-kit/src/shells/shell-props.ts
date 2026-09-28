import type { ReactNode } from 'react';

/** Props shared by TabsShell, FlowShell and AuthShell. */
export type ShellCommonProps = { children: ReactNode; actions?: ReactNode; banner?: ReactNode; contentClassName?: string };
