'use client';
import { BottomSheet } from './BottomSheet';
import type { PickerPanelProps } from './PickerPanel.types';

export function PickerSheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  full,
  triggerRef,
}: PickerPanelProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      full={full}
      footer={footer}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        triggerRef.current?.focus();
      }}
    >
      {children}
    </BottomSheet>
  );
}
