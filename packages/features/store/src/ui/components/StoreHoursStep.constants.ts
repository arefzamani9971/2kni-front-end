import { DAYS_PRESET_VALUES, CLOSED_PRESET_VALUES } from '../../domain/hours-presets.constants';
import { TIME_OPTIONS } from '../../domain/store-draft.constants';
import type { StoreTranslator } from '../i18n/types';
export function createHoursOptions(t: StoreTranslator, digits: (value: string) => string) {
  return {
    days: DAYS_PRESET_VALUES.map((value) => ({ value, label: t(`dayPresets.${value}`) })),
    closed: CLOSED_PRESET_VALUES.map((value) => ({ value, label: t(`closedPresets.${value}`) })),
    times: TIME_OPTIONS.map((value) => ({ value, label: digits(value) })),
  };
}
