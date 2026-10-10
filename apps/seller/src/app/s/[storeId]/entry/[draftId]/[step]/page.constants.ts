import { EntryDetails } from '../../../../../../widgets/EntryDetails';
import {
  EntryDoneScreen,
  EntryPricingScreen,
  EntryReviewScreen,
  EntryStockScreen,
  EntryUnitsScreen,
} from '@dukani/product-entry';

export const STEPS = {
  details: EntryDetails,
  units: EntryUnitsScreen,
  stock: EntryStockScreen,
  pricing: EntryPricingScreen,
  review: EntryReviewScreen,
  done: EntryDoneScreen,
} as const;
