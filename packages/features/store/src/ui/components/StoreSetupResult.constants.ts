import type { SectionState, SetupSection } from '../../domain/store-draft.types';

export const SECTION_LABELS: Readonly<Record<SetupSection, string>> = {
  profile: 'تماس، نشانی، موقعیت و ساعات فعالیت',
  logo: 'عکس فروشگاه',
  private: 'اطلاعات مالک و بانکی',
};

export const SECTION_BADGE: Readonly<
  Record<Exclude<SectionState, 'skipped'>, { tone: 'neutral' | 'success' | 'danger'; label: string }>
> = {
  pending: { tone: 'neutral', label: 'در صف' },
  saving: { tone: 'neutral', label: 'در حال ذخیره' },
  done: { tone: 'success', label: 'ذخیره شد' },
  failed: { tone: 'danger', label: 'ذخیره نشد' },
};
