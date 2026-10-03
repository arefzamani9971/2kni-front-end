import type { ICONS } from './Icon.constants';

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Accessible label; decorative icons (default) are hidden from screen readers. */
  label?: string;
};
