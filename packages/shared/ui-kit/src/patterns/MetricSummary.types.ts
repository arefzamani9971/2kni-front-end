import type { ReactNode } from 'react';
import type { IconName } from '../icons/Icon.types';

export type SummaryMetric = { id: string; text: ReactNode; icon: IconName; tone?: 'brand' | 'warning' };

export type MetricSummaryProps = {
  label: string;
  avatarLabel: string;
  metrics: readonly SummaryMetric[];
  description?: ReactNode;
};
