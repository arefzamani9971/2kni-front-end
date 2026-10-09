import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { IconButton } from '../primitives/IconButton';
import { Link } from '../primitives/Link';
import { Icon } from '../icons/Icon';
import type { AppBarProps } from './AppBar.types';

/** Figma `App Bar` (69:2): 56px, bottom border, back (44px) at the start, title 18/DemiBold. */
export function AppBar({ title, back, backLabel, actions, className }: AppBarProps) {
  const t = useUiTranslations();
  backLabel ??= t('controls.back');

  return (
    <div
      className={cn('border-line bg-surface flex h-14 w-full items-center gap-2 border-b px-2', className)}
    >
      {typeof back === 'string' ? (
        <Link
          href={back}
          aria-label={backLabel}
          className="text-icon hover:bg-muted inline-flex size-11 items-center justify-center rounded-md"
        >
          <Icon name="back" size={24} />
        </Link>
      ) : back ? (
        <IconButton icon="back" label={backLabel} onClick={back} />
      ) : null}
      <h1 className="text-heading-m text-fg-primary min-w-0 flex-1 truncate">{title}</h1>
      {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
    </div>
  );
}
