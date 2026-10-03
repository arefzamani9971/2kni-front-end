'use client';
import { useContainer } from '@dukani/platform';
import type { CustomerContainer } from './container.types';

export const useCustomer = () => useContainer<CustomerContainer>();
