'use client';
import { useLocale } from '@dukani/i18n';
import { useAppForm } from '../adapters/react-hook-form';
import type { AnySchema, UseAppFormOptions } from '../adapters/react-hook-form/use-app-form.types';

/** Presentation adapter: changing locale refreshes existing validation errors without resetting input. */
export function useLocalizedAppForm<S extends AnySchema>(options: UseAppFormOptions<S>) {
  const locale = useLocale();
  return useAppForm({ ...options, validationKey: locale });
}
