import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  selected?: boolean;
  children: ReactNode;
};
