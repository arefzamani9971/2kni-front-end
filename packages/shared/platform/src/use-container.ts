'use client';
import { useContext } from 'react';
import { ContainerContext } from './container-context';

export function useContainer<T>(): T {
  const c = useContext(ContainerContext);
  if (c === null) throw new Error('ContainerProvider is missing (see the app composition root).');
  return c as T;
}
