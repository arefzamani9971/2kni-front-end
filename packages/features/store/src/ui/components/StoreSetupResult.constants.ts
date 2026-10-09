import type { StoreTranslator } from '../i18n/types';
import type { SectionState, SetupSection } from '../../domain/store-draft.types';

export const createSectionLabels = (t: StoreTranslator): Readonly<Record<SetupSection, string>> => ({
  profile: t('contactSection'),
  logo: t('photo'),
  private: t('privateDetails'),
});

export const createSectionBadges = (
  t: StoreTranslator,
): Readonly<
  Record<Exclude<SectionState, 'skipped'>, { tone: 'neutral' | 'success' | 'danger'; label: string }>
> => ({
  pending: { tone: 'neutral', label: t('pending') },
  saving: { tone: 'neutral', label: t('saving') },
  done: { tone: 'success', label: t('saved') },
  failed: { tone: 'danger', label: t('saveFailed') },
});
