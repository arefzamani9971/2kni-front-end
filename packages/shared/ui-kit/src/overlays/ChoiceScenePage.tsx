'use client';
import { Button } from '../primitives/Button';
import type { ChoiceSceneProps } from './ChoiceScene.types';
import { FormScene } from './FormScene';

/** Figma 594:6632: the alternatives as page actions on mobile. */
export function ChoiceScenePage({
  primaryAction,
  secondaryAction,
  alternatives,
  ...props
}: ChoiceSceneProps) {
  return (
    <FormScene
      {...props}
      actions={
        <>
          {primaryAction}
          {alternatives.map((choice) => (
            <Button key={choice.id} block variant="secondary" onClick={choice.onSelect}>
              {choice.label}
            </Button>
          ))}
          {secondaryAction}
        </>
      }
    />
  );
}
