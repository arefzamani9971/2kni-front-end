'use client';
import { memo, useCallback, useSyncExternalStore } from 'react';
import { AttachmentRecordContent } from './AttachmentRecordContent';
import type { AttachmentRecordCellProps } from '../types/AttachmentRecordCell.types';

/** Each editable cell observes only its own immutable draft row. */
export const AttachmentRecordCell = memo(function AttachmentRecordCell({
  selection,
  ...props
}: AttachmentRecordCellProps) {
  const get = useCallback(() => selection.get(props.candidate.item.id), [selection, props.candidate.item.id]);
  const selected = useSyncExternalStore(selection.subscribe, get, get);
  return <AttachmentRecordContent {...props} selected={selected} />;
});
