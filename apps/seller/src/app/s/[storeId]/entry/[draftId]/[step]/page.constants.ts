import {
  EntryDetailsScreen,
  EntryDoneScreen,
  EntryPricingScreen,
  EntryReviewScreen,
  EntryStockScreen,
  EntryUnitsScreen,
} from '@dukani/product-entry';

export const STEPS = {
  details: EntryDetailsScreen,
  units: EntryUnitsScreen,
  stock: EntryStockScreen,
  pricing: EntryPricingScreen,
  review: EntryReviewScreen,
  done: EntryDoneScreen,
} as const;
