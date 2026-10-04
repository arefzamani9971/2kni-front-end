import { s } from '@dukani/forms';
import { closedOverlap } from '../../domain/store-draft';

/** storehours (594:6767): an open day needs both times and they may not be equal; overnight is allowed (F02 §6). */
export const hoursSchema = s
  .object({
    days: s.enum(['sat-wed', 'sat-thu', 'all']),
    opens: s.string().regex(/^\d{2}:\d{2}$/, 'ساعت شروع را انتخاب کنید.'),
    closes: s.string().regex(/^\d{2}:\d{2}$/, 'ساعت پایان را انتخاب کنید.'),
    closed: s.enum(['none', 'fri', 'thu-fri']),
  })
  .superRefine((h, ctx) => {
    if (h.opens === h.closes)
      ctx.addIssue({ code: 'custom', path: ['closes'], message: 'ساعت پایان با ساعت شروع یکی است.' });
    if (closedOverlap(h).length)
      ctx.addIssue({
        code: 'custom',
        path: ['closed'],
        message: 'روز تعطیل جزو روزهای فعالیت انتخاب شده است.',
      });
  });
