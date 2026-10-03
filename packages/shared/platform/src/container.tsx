'use client';
import type { ReactNode } from 'react';
import { ContainerContext } from './container-context';

export function ContainerProvider<T>({ container, children }: { container: T; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}
