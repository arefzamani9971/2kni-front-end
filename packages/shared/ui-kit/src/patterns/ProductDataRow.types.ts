import type { ReactNode } from 'react';
import type { Tone } from '../lib/types';

export type ProductDataRowProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  metaTone?: Tone;
  /** Image URL, or the first letter of the title is shown on a brand-subtle tile. */
  imageUrl?: string | null;
  initial?: string;
  badge?: ReactNode;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  trailing?: ReactNode;
  className?: string;
};
