import type { ReactNode } from 'react';
import type { AttachmentRecordContentProps } from './AttachmentRecordContent.types';

export type AttachmentRecordCardProps = Record<
  Exclude<AttachmentRecordContentProps['part'], 'card'>,
  ReactNode
>;
