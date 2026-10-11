'use client';
import { ScreenTop } from '../shells/ScreenTop';
import { AppBar } from './AppBar';
import type { PageHeaderProps } from './PageHeader.types';

/** Figma catalog 358:485: the mobile app bar (title and back only). */
export function PageHeaderBar({ title, back }: PageHeaderProps) {
  return (
    <ScreenTop>
      <AppBar title={title} back={back} />
    </ScreenTop>
  );
}
