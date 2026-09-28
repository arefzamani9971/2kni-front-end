import { Icon } from '../icons/Icon';

export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-warning-subtle px-4 py-2 text-label-s text-warning">
      <Icon name="offline" size={16} />
      اتصال اینترنت برقرار نیست؛ ثبت نهایی غیرفعال است و پیش‌نویس‌ها حفظ می‌شوند.
    </div>
  );
}
