'use client';
import { useContext } from 'react';
import { NavigationContext } from './navigation-context';
import type { Navigation } from './navigation.types';

export function useNavigation(): Navigation {
  const nav = useContext(NavigationContext);
  if (!nav) throw new Error('NavigationProvider is missing.');
  return nav;
}
