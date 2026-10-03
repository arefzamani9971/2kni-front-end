'use client';
import { useContext } from 'react';
import type { ShowToast } from './Toast.types';
import { ToastContext } from './toast-context';

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error('ToastProvider is missing.');
  return show;
}
