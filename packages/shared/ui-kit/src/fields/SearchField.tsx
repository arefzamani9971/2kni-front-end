'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';

import { Icon } from '../icons/Icon';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField.types';

/**
 * Search box: icon at the start, clear button, `type=search`. Debounce belongs to the caller's query hook.
 * Figma: Dukani/Search Field (1387:1505), desktop/mobile density through the shared TextField.
 */
export function SearchField({
  placeholder,
  ...props
}: Omit<TextFieldProps, 'type' | 'prefix' | 'clearable'>) {
  const t = useUiTranslations();
  placeholder ??= t('controls.search');

  return (
    <TextField
      {...props}
      type="search"
      placeholder={placeholder}
      clearable
      prefix={<Icon name="search" size={20} />}
      inputProps={{ enterKeyHint: 'search', ...props.inputProps }}
    />
  );
}
