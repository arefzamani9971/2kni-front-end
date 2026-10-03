'use client';
import { createContext } from 'react';
import type { ShellNav } from './ShellNavProvider.types';

export const ShellNavContext = createContext<ShellNav | null>(null);
