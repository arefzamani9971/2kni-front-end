import type { Ref, ReactNode } from 'react';

export type ScanWorkspaceProps = {
  videoRef?: Ref<HTMLVideoElement>;
  active: boolean;
  preview: boolean;
  hint: string;
  status: string;
  actions: readonly { kind: 'keyboard' | 'layers' | 'settings'; label: string; onClick: () => void }[];
  children?: ReactNode;
};
