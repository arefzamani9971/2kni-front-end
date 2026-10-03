import type { ReactNode } from 'react';
import type { IconName } from '../icons/Icon.types';
import type { Tone } from '../lib/types';

export type BadgeProps = {
  tone?: Tone;
  /** `subtle` = tinted fill (Verified, Available…); `outline` = surface + status border (Pending, StoreSpecific, Conflict). */
  appearance?: 'subtle' | 'outline';
  size?: 'sm' | 'md';
  icon?: IconName;
  children: ReactNode;
  className?: string;
};
