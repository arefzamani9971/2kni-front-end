'use client';
import { Button } from '../primitives/Button';
import type { FeatureActionProps } from './FeatureAction.types';

/** Figma attrs 358:491: an outline button on mobile. */
export function FeatureActionButton({ label, onClick }: FeatureActionProps) {
  return (
    <Button block variant="secondary" onClick={onClick}>
      {label}
    </Button>
  );
}
