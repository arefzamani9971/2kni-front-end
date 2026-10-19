import type { EntryCommands } from '../../../application/ports';

export type BulkPreviewSummaryProps = {
  data: Awaited<ReturnType<EntryCommands['validateBulk']>>;
  onRefreshRow?: (id: string) => void;
};
