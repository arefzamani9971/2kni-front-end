import type { IconName } from '../icons/Icon.types';

export type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  href: string;
  /** Shown but not reachable yet (e.g. store destinations before a store exists). */
  disabled?: boolean;
};
