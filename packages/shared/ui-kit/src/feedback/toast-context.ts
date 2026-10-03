'use client';
import { createContext } from 'react';
import type { ShowToast } from './Toast.types';

export const ToastContext = createContext<ShowToast | null>(null);
