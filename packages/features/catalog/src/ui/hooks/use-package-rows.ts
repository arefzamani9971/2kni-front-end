'use client';
import { useState } from 'react';
import { MAX_PACKAGINGS, packagingIssues, withPackageKey } from '../../domain/packagings';
import type { PackageRow } from '../components/CreateTypeForm.types';

/** Default package rows with stable keys and per-row issues, shown only after the first submit attempt. */
export function usePackageRows(initial: readonly PackageRow[], unitMaxDecimals: number) {
  const [rows, setRows] = useState(() => initial.map(withPackageKey));
  const [showIssues, setShowIssues] = useState(false);
  const issues = packagingIssues(rows, unitMaxDecimals);
  const valid = !issues.tooMany && issues.rows.every((row) => !row.name && !row.baseQty);
  const patch = (key: string, change: Partial<PackageRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)));
  return {
    rows,
    issues,
    valid,
    showIssues,
    canAdd: rows.length < MAX_PACKAGINGS,
    add: () => setRows((current) => [...current, withPackageKey<PackageRow>({ name: '', baseQty: '' })]),
    remove: (key: string) => setRows((current) => current.filter((row) => row.key !== key)),
    rename: (key: string, name: string) => patch(key, { name }),
    setQuantity: (key: string, baseQty: string) => patch(key, { baseQty }),
    revealIssues: () => setShowIssues(true),
    /** Wire shape: trimmed names, local keys dropped. */
    toRequest: () => rows.map(({ name, baseQty }) => ({ name: name.trim(), baseQty })),
  };
}
