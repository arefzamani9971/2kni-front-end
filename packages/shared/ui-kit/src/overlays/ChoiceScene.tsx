'use client';
import { createAdaptive } from '../responsive/adaptive';
import { Button } from '../primitives/Button';
import { FormScene } from './FormScene';
import type { ChoiceSceneProps } from './ChoiceScene.types';
const markers = {
  tag: new URL('./assets/brand-tag.svg', import.meta.url).href,
  warning: new URL('./assets/brand-unknown.svg', import.meta.url).href,
};
/** Figma 594:6632 / 597:3955: page actions on mobile, alternative tiles in the desktop dialog. */
function ChoicePage({ primaryAction, secondaryAction, alternatives, ...props }: ChoiceSceneProps) {
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
function ChoiceDialog({
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
              <img src={markers[choice.marker]} alt="" width={24} height={24} />
            </span>
            <span className="text-heading-s">{choice.label}</span>
          </button>
        ))}
      </div>
    </FormScene>
  );
}
export const ChoiceScene = createAdaptive<ChoiceSceneProps>('ChoiceScene', {
  mobile: ChoicePage,
  desktop: ChoiceDialog,
});
