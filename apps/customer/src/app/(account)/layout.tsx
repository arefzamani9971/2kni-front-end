'use client';
import type { ReactNode } from 'react';
import { SignedIn } from '../../composition/providers';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <SignedIn>{children}</SignedIn>;
}
