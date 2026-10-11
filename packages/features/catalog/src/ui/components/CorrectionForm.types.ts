import type {
  CorrectionCapabilities,
  CorrectionDraft,
  CorrectionRequest,
} from '../../domain/correction.types';

export type CorrectionFormProps = {
  capabilities: CorrectionCapabilities;
  initial: CorrectionDraft;
  persist: (draft: CorrectionDraft) => Promise<void>;
  clear: () => Promise<void>;
  onCreated: (correction: CorrectionRequest) => void;
  onBack: () => void;
};
