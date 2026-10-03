'use client';
import { Icon } from '../icons/Icon';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField.types';

/** Search box: icon at the start, clear button, `type=search`. Debounce belongs to the caller's query hook. */
export function SearchField({
  placeholder = 'جست‌وجو',
  ...props
}: Omit<TextFieldProps, 'type' | 'prefix' | 'clearable'>) {
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
