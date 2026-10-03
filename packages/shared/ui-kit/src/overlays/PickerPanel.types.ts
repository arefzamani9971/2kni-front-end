import type { ReactNode, RefObject } from 'react';

/**
 * The panel a field opens to pick a value (Select, Autocomplete, Date). Figma `Select` (649:666) and
 * `Interaction rules`: «on touch present choices in a modal bottom sheet … on desktop a list attached to the
 * input». Mobile → BottomSheet with an accessible title and close; Desktop → popover anchored to the field box,
 * same width, Shadow/Medium. Focus returns to the trigger on close in both.
 */
export type PickerPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sheet title on mobile; accessible name of the popover on desktop. */
  title: ReactNode;
  /** The field box the desktop popover attaches to. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Receives focus back when the panel closes. */
  triggerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** Sticky part under the list (e.g. «ساخت نوع جدید»). */
  footer?: ReactNode;
  /** Long lists: full-height sheet on mobile (desktop keeps the anchored popover with its own scroll). */
  full?: boolean;
};
