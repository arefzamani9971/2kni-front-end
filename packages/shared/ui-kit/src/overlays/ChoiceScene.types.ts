import type { ReactNode } from 'react';
import type { OverlayProps } from './Overlay.types';
export type ChoiceSceneProps = Omit<OverlayProps, 'actions'> & {
  readonly primaryAction: ReactNode;
  readonly secondaryAction?: ReactNode;
  readonly alternatives: readonly {
    readonly id: string;
    readonly label: string;
    readonly marker: 'tag' | 'warning';
    readonly onSelect: () => void;
  }[];
};
