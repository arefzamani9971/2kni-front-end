'use client';
import { createAdaptive } from '../responsive/adaptive';
import { DatePickerSheet } from './DatePickerSheet';
import { DatePickerPopover } from './DatePickerPopover';
import type { DatePickerPanelProps } from './DatePickerPanel.types';

/** Figma Dukani/Date Picker Responsive (633:688): one draft, two interaction strategies. */
export const DatePickerPanel = createAdaptive<DatePickerPanelProps>('DatePickerPanel', {
  mobile: DatePickerSheet,
  desktop: DatePickerPopover,
});
