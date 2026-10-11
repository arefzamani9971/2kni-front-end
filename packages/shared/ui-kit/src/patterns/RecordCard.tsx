'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { RecordCardProps } from './RecordCard.types';
import { RecordCardTile } from './RecordCardTile';
import { RecordCardRow } from './RecordCardRow';

/** Figma category 358:486/5349: mobile data row, desktop compact identity card. */
export const RecordCard = createAdaptive<RecordCardProps>('RecordCard', {
  mobile: RecordCardRow,
  desktop: RecordCardTile,
});
