'use client';
import { SelectionCheckbox } from './SelectionCheckbox';
import type { SelectionStore } from './selection-store.types';
import { useGroupSelection } from './use-group-selection';

/**
 * «Select all» of the visible group: the current page on desktop (header of the first column), the loaded cards on
 * mobile. Mixed when the group is partly selected; ticking it selects the whole group, unticking clears it.
 */
export function GroupSelectToggle({
  store,
  ids,
  label,
}: {
  store: SelectionStore;
  ids: readonly string[];
  label: string;
}) {
  const state = useGroupSelection(store, ids);
  return (
    <SelectionCheckbox
      checked={state === 'all' ? true : state === 'some' ? 'mixed' : false}
      disabled={!ids.length}
      label={label}
      onChange={(checked) => store.setMany(ids, checked)}
    />
  );
}
