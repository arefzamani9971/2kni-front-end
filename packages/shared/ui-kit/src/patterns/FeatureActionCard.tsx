'use client';
import { Icon } from '../icons/Icon';
import { FEATURE_MARKERS } from './FeatureAction.constants';
import type { FeatureActionProps } from './FeatureAction.types';

/** Figma attrs 358:5354 and «Desktop Action Tile» (detail 312:1441): a feature card with a marker or icon on desktop. */
export function FeatureActionCard({ label, kind, icon, onClick }: FeatureActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line bg-surface hover:bg-muted focus-visible:outline-focus flex min-h-32 flex-col items-start gap-3 rounded-md border p-4 text-start focus-visible:outline-2"
    >
      <span className="bg-brand-subtle flex size-10 items-center justify-center rounded-sm">
        {icon ? (
          <Icon name={icon} size={24} className="text-fg-brand" />
        ) : kind ? (
          <img src={FEATURE_MARKERS[kind]} width={24} height={24} alt="" />
        ) : null}
      </span>
      <span className="text-label-m text-fg-primary">{label}</span>
    </button>
  );
}
