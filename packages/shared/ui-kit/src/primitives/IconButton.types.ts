import type { ButtonHTMLAttributes, Ref } from 'react';
import type { IconName } from '../icons/Icon.types';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  /** Required accessible name (icon-only buttons, ui-guidelines §15). */
  label: string;
  size?: number;
  tone?: 'default' | 'brand' | 'danger';
  ref?: Ref<HTMLButtonElement>;
};
