'use client';
import type { ReactNode } from 'react';
import { SignedIn } from '../../composition/signed-in';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <SignedIn>{children}</SignedIn>;
}
