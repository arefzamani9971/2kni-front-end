'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { RecordListProps } from './RecordList.types';
import { RecordListTable } from './RecordListTable';
import { RecordListCards } from './RecordListCards';

/** Figma catalog list 358:485/5348 and type schema 358:487/5350: cards on mobile, table on desktop. */
export const RecordList = createAdaptive<RecordListProps>('RecordList', {
  mobile: RecordListCards,
  desktop: RecordListTable,
});
