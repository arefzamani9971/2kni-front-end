'use client';
import { useContainer } from '@dukani/platform';
import type { CustomerContainer } from './container';

export const useCustomer = () => useContainer<CustomerContainer>();
