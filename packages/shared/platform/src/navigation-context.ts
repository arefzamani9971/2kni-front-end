'use client';
import { createContext } from 'react';
import type { Navigation } from './navigation.types';

export const NavigationContext = createContext<Navigation | null>(null);
