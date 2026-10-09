import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';

export function OfflineBanner({ online }: { online: boolean }) {
  const t = useUiTranslations();

  if (online) return null;
  return (
    <div
      role="status"
      className="bg-warning-subtle text-label-s text-warning flex items-center gap-2 px-4 py-2"
    >
      <Icon name="offline" size={16} />
      {t('controls.offline')}
    </div>
  );
}
