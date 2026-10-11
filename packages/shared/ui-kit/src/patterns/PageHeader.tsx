'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { PageHeaderProps } from './PageHeader.types';
import { PageHeaderHeading } from './PageHeaderHeading';
import { PageHeaderBar } from './PageHeaderBar';

/** Figma catalog 358:485/5348: mobile AppBar, desktop title/context and actions. */
export const PageHeader = createAdaptive<PageHeaderProps>('PageHeader', {
  mobile: PageHeaderBar,
  desktop: PageHeaderHeading,
});
