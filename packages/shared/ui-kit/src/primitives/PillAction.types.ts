import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import type { IconName } from '../icons/Icon.types';

export type PillActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon?: IconName;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
};
