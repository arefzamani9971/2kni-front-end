'use client';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * Dependency injection through React context. Each app builds its container once in its
 * composition root (repositories, http, session…) and features read what they need with
 * `useContainer<SellerContainer>()`. Tests pass a fake container.
 */
const ContainerContext = createContext<unknown>(null);

export function ContainerProvider<T>({ container, children }: { container: T; children: ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer<T>(): T {
  const c = useContext(ContainerContext);
  if (c === null) throw new Error('ContainerProvider is missing (see the app composition root).');
  return c as T;
}
