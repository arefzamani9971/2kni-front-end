import type { AttachmentSelection } from '../../../domain/catalog-attachment.types';

/** External-store projection: stable snapshots until the canonical draft selection changes. */
export function createAttachmentSelectionProjection(getSelections: () => AttachmentSelection[] | undefined) {
  let previous: AttachmentSelection[] | undefined;
  let byId = new Map<string, AttachmentSelection>();
  let ids: ReadonlySet<string> = new Set();
  const read = () => {
    const selections = getSelections();
    if (selections !== previous) {
      previous = selections;
      byId = new Map(selections?.map((entry) => [entry.row.catalogItemId, entry]));
      if (ids.size !== byId.size || [...ids].some((id) => !byId.has(id))) ids = new Set(byId.keys());
    }
    return byId;
  };
  return {
    read,
    ids: () => {
      read();
      return ids;
    },
  };
}
