import type { AppError, SubmitState } from '@dukani/domain';
import type { StoreProfile } from '../../application/ports';
import type {
  SectionState,
  SetupSection,
  StoreDraft,
  StorePrivateDraft,
} from '../../domain/store-draft.types';

export type SetupSections = Readonly<Record<SetupSection, SectionState>>;

export type StoreSetup = {
  /** null while the saved draft is being read. */
  readonly draft: StoreDraft | null;
  readonly privateInfo: StorePrivateDraft | null;
  readonly logo: File | null;
  readonly update: (patch: Partial<StoreDraft>) => void;
  readonly setPrivateInfo: (value: StorePrivateDraft | null) => void;
  readonly setLogo: (file: File | null) => void;
  /** `POST /stores` (once), then every optional section on the same store id. */
  readonly create: () => Promise<void>;
  readonly createState: SubmitState<unknown>;
  /** Re-sends the create with the same operation id (lost response). */
  readonly checkAgain: () => Promise<void>;
  readonly busy: boolean;
  /** The created store (STORE-SUCCESS); null before. */
  readonly store: StoreProfile | null;
  readonly sections: SetupSections;
  readonly sectionErrors: Readonly<Partial<Record<keyof SetupSections, AppError>>>;
  readonly retrySection: (section: keyof SetupSections) => Promise<void>;
  /** Leaves the flow: the pending draft is removed. */
  readonly finish: () => Promise<void>;
};
