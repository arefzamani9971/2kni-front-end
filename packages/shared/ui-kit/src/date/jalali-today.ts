import { fromJalali, toDateOnly, toJalali, type DateOnly } from '@dukani/domain';

export const jalaliToday = (): DateOnly => toDateOnly(fromJalali(toJalali(new Date())));
