'use client';
import { createAdaptive } from '../responsive/adaptive';
import { Button } from '../primitives/Button';
type Props = { label: string; kind: 'brand' | 'image'; onClick: () => void };
const markers = {
  brand: new URL('../overlays/assets/feature-tag.svg', import.meta.url).href,
  image: new URL('../overlays/assets/feature-image.svg', import.meta.url).href,
};
/** Figma attrs 358:491/5354: outline button on mobile, feature card on desktop. */
function Action({ label, onClick }: Props) {
  return (
    <Button block variant="secondary" onClick={onClick}>
      {label}
    </Button>
  );
}
function Card({ label, kind, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line bg-surface hover:bg-muted focus-visible:outline-focus flex min-h-32 flex-col items-start gap-3 rounded-md border p-4 text-start focus-visible:outline-2"
    >
      <span className="bg-brand-subtle flex size-10 items-center justify-center rounded-sm">
        <img src={markers[kind]} width={24} height={24} alt="" />
      </span>
      <span className="text-label-m text-fg-primary">{label}</span>
    </button>
  );
}
export const FeatureAction = createAdaptive<Props>('FeatureAction', { mobile: Action, desktop: Card });
