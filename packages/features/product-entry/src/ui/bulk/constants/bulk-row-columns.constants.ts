import type { BulkRowColumn } from '../types/BulkRows.types';

export const BULK_ROW_COLUMNS = [
  { id: 'title', headerKey: 'storeProduct' },
  { id: 'quantity', headerKey: 'quantity' },
  { id: 'unit', headerKey: 'catalogUnit' },
  { id: 'cost', headerKey: 'initialCost' },
  { id: 'delete', headerKey: 'bulk.delete' },
] as const satisfies readonly BulkRowColumn[];
