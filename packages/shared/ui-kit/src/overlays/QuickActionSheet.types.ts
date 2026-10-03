import type { ReactNode } from 'react';
import type { IconName } from '../icons/Icon.types';

export type QuickAction = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  onSelect: () => void;
  disabled?: boolean;
};
