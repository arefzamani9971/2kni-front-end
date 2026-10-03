'use client';
import { useViewport } from './use-viewport';

export const useIsDesktop = () => useViewport() === 'desktop';
