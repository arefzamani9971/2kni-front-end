'use client';
import { FEATURE_MARKERS } from './FeatureAction.constants';
import type { FeatureActionProps } from './FeatureAction.types';

/** Figma attrs 358:5354: a feature card with icon on desktop. */
export function FeatureActionCard({ label, kind, onClick }: FeatureActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line bg-surface hover:bg-muted focus-visible:outline-focus flex min-h-32 flex-col items-start gap-3 rounded-md border p-4 text-start focus-visible:outline-2"
    >
      <span className="bg-brand-subtle flex size-10 items-center justify-center rounded-sm">
        <img src={FEATURE_MARKERS[kind]} width={24} height={24} alt="" />
      </span>
      <span className="text-label-m text-fg-primary">{label}</span>
    </button>
  );
}
