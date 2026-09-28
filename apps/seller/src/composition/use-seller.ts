'use client';
import { useContainer } from '@dukani/platform';
import type { SellerContainer } from './container';

export const useSeller = () => useContainer<SellerContainer>();
