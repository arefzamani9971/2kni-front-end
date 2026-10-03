'use client';
import type { Viewport } from '@dukani/design-tokens';
import { createContext } from 'react';

export const ViewportContext = createContext<Viewport | null>(null);
