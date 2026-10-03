import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { AlertProps } from './Alert.types';
import { TONES } from './Alert.constants';

/**
 * Figma `Production/Alert` (494:89): radius md, px spacing/4, py spacing/3, gap spacing/3, 24px status icon,
 * Label/M title + Body/M message. Danger = danger-subtle fill with danger text; Warning/Info (and Success) =
 * surface fill + status border + primary text. Validation errors never use green/brand frames (ui-guidelines).
 */
export function Alert({ tone = 'danger', title, description, action, className }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex w-full items-start gap-3 rounded-md border px-4 py-3', t.box, className)}
    >
      <Icon name={t.icon} size={24} className={cn('shrink-0', t.iconClass)} />
      <div className="text-body-m flex flex-1 flex-col gap-2">
        <p className="text-label-m">{title}</p>
        {description ? <div className="text-body-m">{description}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
