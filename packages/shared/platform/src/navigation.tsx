'use client';
import { createContext, useContext, type ReactNode } from 'react';

/** Router port: features navigate without importing the app's router. */
export type Navigation = {
  push(href: string): void;
  replace(href: string): void;
  back(): void;
};

const NavigationContext = createContext<Navigation | null>(null);

export function NavigationProvider({ value, children }: { value: Navigation; children: ReactNode }) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): Navigation {
  const nav = useContext(NavigationContext);
  if (!nav) throw new Error('NavigationProvider is missing.');
  return nav;
}
