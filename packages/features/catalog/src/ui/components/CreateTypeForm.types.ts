import type { ReactNode } from 'react';
export type CreateTypeFormProps = {
  readonly present?: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
  readonly draftId?: string;
  readonly initialName?: string;
  readonly onCreated: (type: { id: string; name: string }) => void;
  readonly onCancel: () => void;
};
