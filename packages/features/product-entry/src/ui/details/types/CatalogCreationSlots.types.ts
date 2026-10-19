import type { ReactNode } from 'react';
export type CatalogCreationSlots = {
  readonly brand?: (props: {
    present: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
    draftId: string;
    initialName: string;
    onCreated: (brand: { id: string; name: string }) => void;
    onCancel: () => void;
  }) => ReactNode;
  readonly type?: (props: {
    present: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
    draftId: string;
    initialName: string;
    onCreated: (type: { id: string; name: string }) => void;
    onCancel: () => void;
  }) => ReactNode;
};
