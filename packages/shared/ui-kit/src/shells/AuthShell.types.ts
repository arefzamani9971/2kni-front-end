import type { ReactNode } from 'react';
import type { AppBarProps } from '../patterns/AppBar.types';
import type { ShellCommonProps } from './shell-props';
import type { AlertProps } from '../feedback/Alert.types';

/**
 * `split` — seller (Figma 17/16 AUTH-01/02 358:478…358:5342): mobile App Bar; desktop brand panel and auth card.
 * `cards` — customer (Figma 20b/20 AUTH-01/02 310:379…310:34): page header (title + context line) and
 * content cards; desktop «Two-column workspace» and the «Auth branding» sidebar.
 */
export type AuthLayout = 'split' | 'cards';

type AuthContentProps = ShellCommonProps & {
  title: ReactNode;
  /** Product introduction. The shell owns its placement. */
  introduction?: string;
  /** Information about the identity being verified, supplied once for all viewports. */
  identity?: ReactNode;
  notice?: Pick<AlertProps, 'title' | 'description' | 'tone'>;
  /** split: below the form. cards: heading of the second card (resend countdown). */
  note?: ReactNode;
  /** In-content secondary actions. split: under the form. cards: inside the second card. */
  footer?: ReactNode;
};

export type AuthSplitProps = AuthContentProps & {
  layout?: 'split';
  back?: AppBarProps['back'];
  brand?: { name: string; workspace: string; description: string };
  recovery?: boolean;
  subtitle?: never;
  cardTitle?: never;
};

export type AuthCardsProps = AuthContentProps & {
  layout: 'cards';
  subtitle?: ReactNode;
  cardTitle?: ReactNode;
  back?: never;
  brand?: never;
  recovery?: never;
};

export type AuthShellProps = AuthSplitProps | AuthCardsProps;
