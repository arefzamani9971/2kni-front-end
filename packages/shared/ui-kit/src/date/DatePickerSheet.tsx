'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { BottomSheet } from '../overlays/BottomSheet';
import { Button } from '../primitives/Button';
import { JalaliDateWheels } from './JalaliDateWheels';
import type { DatePickerPanelProps } from './DatePickerPanel.types';

/** Figma 633:495: 390×419, Persian wheels; no calendar or typed entry on mobile. */
export function DatePickerSheet(props: DatePickerPanelProps) {
  const t = useUiTranslations();
  return (
    <BottomSheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('date.title')}
      layout="compact"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        props.triggerRef.current?.focus();
      }}
      footer={
        <div className="grid grid-cols-[minmax(0,226fr)_minmax(0,120fr)] gap-3">
          <Button block disabled={!props.canConfirm || !props.draft} onClick={props.onConfirm}>
            {t('date.confirm')}
          </Button>
          <Button block variant="secondary" onClick={props.onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      }
    >
      <JalaliDateWheels
        value={props.cursorDate}
        onChange={props.onPartChange}
        min={props.min}
        max={props.max}
        error={props.typedError ?? (!props.draft ? t('date.emptyWheel') : null)}
        announcement={props.announcement}
        onSettlingChange={props.onSettlingChange}
      />
    </BottomSheet>
  );
}
