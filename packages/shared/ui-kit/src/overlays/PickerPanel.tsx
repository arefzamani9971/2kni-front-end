'use client';

import { createAdaptive } from '../responsive/adaptive';

import type { PickerPanelProps } from './PickerPanel.types';
import { PickerSheet } from './PickerSheet';
import { PickerPopover } from './PickerPopover';

export const PickerPanel = createAdaptive<PickerPanelProps>('PickerPanel', {
  mobile: PickerSheet,
  desktop: PickerPopover,
});
