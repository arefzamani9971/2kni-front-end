import type { useBrandChoices } from '../hooks/use-brand-choices';
import type { DetailsForm } from './NewItemDetails.types';

export type DetailsBrandSelectionProps = {
  readonly form: DetailsForm;
  readonly brands: ReturnType<typeof useBrandChoices>;
  readonly onClose: () => void;
  /** Hands a new brand name to the in-place creation; absent when this host cannot create brands. */
  readonly onCreate?: (name: string) => void;
};
