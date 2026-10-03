import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import type { IconName } from '../icons/Icon.types';
import type { buttonVariants } from './Button.variants';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Keeps the width and label while a request runs; the button is disabled meanwhile. */
    loading?: boolean;
    iconStart?: IconName;
    iconEnd?: IconName;
    /** Render the child element (e.g. a Link) with button styles. */
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
    children?: ReactNode;
  };
