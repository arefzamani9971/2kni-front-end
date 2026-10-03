export const PERIOD_LABELS: Record<string, string> = {
  Today: 'امروز',
  Yesterday: 'دیروز',
  ThisWeek: 'این هفته',
  LastWeek: 'هفتهٔ قبل',
  ThisMonth: 'این ماه',
  LastMonth: 'ماه قبل',
  Last7Days: '۷ روز اخیر',
  Last30Days: '۳۰ روز اخیر',
  Last90Days: '۹۰ روز اخیر',
  ThisYear: 'امسال',
  Custom: 'بازهٔ دلخواه',
};

/** Sales are not simulated yet: the summary uses FIXTURE-01 figures scaled by period; stock numbers are live. */
export const SCALE: Record<string, number> = {
  Today: 1,
  Yesterday: 0.9,
  ThisWeek: 5,
  LastWeek: 6,
  ThisMonth: 21,
  LastMonth: 26,
  Last7Days: 7,
  Last30Days: 28,
};
