'use client';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { InStore } from '../../../composition/in-store';

export default function StoreLayout({ children }: { children: ReactNode }) {
  const { storeId } = useParams<{ storeId: string }>();
  return <InStore storeId={storeId}>{children}</InStore>;
}
