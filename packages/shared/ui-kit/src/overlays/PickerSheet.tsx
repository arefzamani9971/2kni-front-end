'use client';
import { BottomSheet } from './BottomSheet';
import type { PickerPanelProps } from './PickerPanel.types';

export function PickerSheet({ open, onOpenChange, title, children, footer, full }: PickerPanelProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title} full={full} footer={footer}>
      {children}
    </BottomSheet>
  );
}
