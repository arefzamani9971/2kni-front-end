import type { Dto } from '@dukani/contracts';
import type { DetailsForm } from './NewItemDetails.types';

export type TitleSimilarItemsProps = {
  readonly form: DetailsForm;
  /** Whether the typed title is free; read by the submit, so writing it renders nothing. */
  readonly availabilityRef: { current: boolean };
  readonly onPickSimilar: (item: Dto<'CatalogItemSummaryDto'>) => Promise<void>;
};
