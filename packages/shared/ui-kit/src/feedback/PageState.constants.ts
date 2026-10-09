import type { IconName } from '../icons/Icon.types';
import type { PageStateKind } from './PageState.types';
export const DEFAULTS: Record<Exclude<PageStateKind, 'loading'>, { icon: IconName }> = {
  empty: { icon: 'list' },
  error: { icon: 'alert-danger' },
  offline: { icon: 'offline' },
  permission: { icon: 'alert-warning' },
  'not-released': { icon: 'info' },
  'unknown-result': { icon: 'spinner' },
  'not-found': { icon: 'search' },
};
