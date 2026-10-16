/**
 * Offset paging can return a row twice when data shifts between page requests; render each id once (PAT-LIST-02:
 * de-duplication by id — it does not recover a row skipped by the shift, a refresh does).
 */
export function uniqueRows<T>(items: readonly T[], getRowId: (row: T) => string): { row: T; id: string }[] {
  const seen = new Set<string>();
  const rows: { row: T; id: string }[] = [];
  for (const row of items) {
    const id = getRowId(row);
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push({ row, id });
  }
  return rows;
}
