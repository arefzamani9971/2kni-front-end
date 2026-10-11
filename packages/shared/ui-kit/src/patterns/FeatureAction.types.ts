import type { IconName } from '../icons/Icon.types';

/**
 * `kind` shows a product-form marker (brand, image); `icon` an icon from the set, as in Figma «Dukani/Desktop Action
 * Tile» (detail 312:1441). One of the two is given.
 */
export type FeatureActionProps = {
  label: string;
  onClick: () => void;
  kind?: 'brand' | 'image';
  icon?: IconName;
};
