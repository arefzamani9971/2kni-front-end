import { DAYS_PRESET_VALUES, CLOSED_PRESET_VALUES } from '../../domain/hours-presets.constants';
import type { StoreTranslator } from '../i18n/types';
import { s } from '@dukani/forms';
import { closedOverlap } from '../../domain/store-draft';

/** storehours (594:6767): an open day needs both times and they may not be equal; overnight is allowed (F02 §6). */
export const hoursSchema = (t: StoreTranslator) =>
  s
    .object({
      days: s.enum(DAYS_PRESET_VALUES),
      opens: s.string().regex(/^\d{2}:\d{2}$/, t('chooseStart')),
      closes: s.string().regex(/^\d{2}:\d{2}$/, t('chooseEnd')),
      closed: s.enum(CLOSED_PRESET_VALUES),
    })
    .superRefine((h, ctx) => {
      if (h.opens === h.closes) ctx.addIssue({ code: 'custom', path: ['closes'], message: t('sameTime') });
      if (closedOverlap(h).length)
        ctx.addIssue({
          code: 'custom',
          path: ['closed'],
          message: t('closedActive'),
        });
    });
