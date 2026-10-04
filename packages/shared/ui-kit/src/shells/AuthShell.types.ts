import type { ReactNode } from 'react';
import type { AppBarProps } from '../patterns/AppBar.types';
import type { ShellCommonProps } from './shell-props';

/**
 * `split` — seller (Figma 17/16 AUTH-01/02 358:478…358:5342): App Bar with back; desktop «Content columns».
 * `cards` — customer (Figma 20b/20 AUTH-01/02 310:379…310:34): page header (title + context line) and
 * content cards; desktop «Two-column workspace» and the «Auth branding» sidebar.
 */
export type AuthLayout = 'split' | 'cards';

export type AuthShellProps = ShellCommonProps & {
  layout?: AuthLayout;
  title: ReactNode;
  /** `split` only: App Bar back. */
  back?: AppBarProps['back'];
  /** `cards` only: context line under the title (Figma «دکانی · نوشت‌افزار الف»). */
  subtitle?: ReactNode;
  /** `cards` only: heading of the form card (e.g. «شمارهٔ همراه شما», «کد ورود»). */
  cardTitle?: ReactNode;
  /** split: above the form on mobile, in the Summary card on desktop. cards: line under the card heading. */
  lead?: ReactNode;
  /** split: below the form / in the Summary card. cards: heading of the second card (resend countdown). */
  note?: ReactNode;
  /** In-content secondary actions. split: under the form. cards: inside the second card. */
  footer?: ReactNode;
};
