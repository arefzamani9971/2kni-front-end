'use client';
import { createContext, useContext, type ReactNode } from 'react';

/**
 * Typed DI slot for one feature module. The feature exports the pair; the app's composition root
 * provides the instance built from its services:
 *
 *   export const [AuthModuleProvider, useAuthModule] = createModuleContext<AuthModule>('auth');
 *   <AuthModuleProvider value={createAuthModule({ api, session })}>…
 */
export function createModuleContext<T>(name: string) {
  const Ctx = createContext<T | null>(null);
  function ModuleProvider({ value, children }: { value: T; children: ReactNode }) {
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }
  const useModule = (): T => {
    const m = useContext(Ctx);
    if (m === null) throw new Error(`The "${name}" module is not provided (see the app composition root).`);
    return m;
  };
  return [ModuleProvider, useModule] as const;
}
