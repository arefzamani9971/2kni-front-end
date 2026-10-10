import type { ReactNode } from 'react';
export type CreateBrandFormProps = {
  readonly present?: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
  readonly draftId?: string;
  readonly initialName?: string;
  readonly onCreated: (brand: { id: string; name: string }) => void;
  readonly onCancel: () => void;
};
