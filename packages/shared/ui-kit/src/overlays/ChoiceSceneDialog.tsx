'use client';
import { CHOICE_MARKERS } from './ChoiceScene.constants';
import type { ChoiceSceneProps } from './ChoiceScene.types';
import { FormScene } from './FormScene';

/** Figma 597:3955: the alternatives as tiles in the desktop dialog. */
export function ChoiceSceneDialog({
  primaryAction,
  secondaryAction,
  alternatives,
  children,
  ...props
}: ChoiceSceneProps) {
  return (
    <FormScene
      {...props}
      actions={
        <>
          {primaryAction}
          {secondaryAction}
        </>
      }
    >
      {children}
      <div className="grid grid-cols-2 gap-3">
        {alternatives.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={choice.onSelect}
            className="border-line bg-surface text-fg-primary focus-visible:outline-focus flex flex-col gap-3 rounded-md border p-4 text-start focus-visible:outline-2"
          >
            <span className="bg-brand-subtle flex size-10 items-center justify-center rounded-sm">
              <img src={CHOICE_MARKERS[choice.marker]} alt="" width={24} height={24} />
            </span>
            <span className="text-heading-s">{choice.label}</span>
          </button>
        ))}
      </div>
    </FormScene>
  );
}
