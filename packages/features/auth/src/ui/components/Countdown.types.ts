import type { ReactNode } from 'react';

export type CountdownProps = {
  /** Epoch ms the countdown runs to. */
  readonly until: number;
  /** Text for the seconds left (0 once `until` is reached). */
  readonly children: (secondsLeft: number) => ReactNode;
};
