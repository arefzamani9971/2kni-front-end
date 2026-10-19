import type { Dto } from '@dukani/contracts';
import { useProductPresentation } from './use-product-presentation';
import { useProductTranslations } from './use-product-translations';

/**
 * Text of one store unit (F12 §3, §7, §13.11): its factor to the base unit, its uses, and its sale price — the
 * explicit one, else the server's effective price (from the single price), else «قیمت فروش ثبت نشده»; never zero and
 * never a price computed here.
 */
export function useUnitPresentation() {
  const t = useProductTranslations();
  const { qty, price } = useProductPresentation();
  const factor = (u: Dto<'StoreProductUnitDto'>, base: string) =>
    // the base unit carries its badge instead of a factor of one
    u.isBase ? null : t('units.factor', { name: u.name, quantity: qty(u.baseQty), base });
  const uses = (u: Dto<'StoreProductUnitDto'>) =>
    u.isPurchasable && u.isSellable
      ? t('units.usesBoth')
      : u.isPurchasable
        ? t('units.usesPurchase')
        : t('units.usesSale');
  const salePrice = (u: Dto<'StoreProductUnitDto'>) => {
    if (!u.isSellable) return null;
    const explicit = price(u.salePriceAmount);
    if (explicit && !u.isBase) return t('units.explicitPrice', { price: explicit });
    const effective = price(u.effectivePriceAmount);
    if (!effective) return t('units.noPrice');
    return u.isBase
      ? t('units.explicitPrice', { price: effective })
      : t('units.derivedPrice', { price: effective });
  };
  /** One line under the unit's name: factor · uses · price · barcode. */
  const details = (u: Dto<'StoreProductUnitDto'>, base: string) =>
    [
      factor(u, base),
      uses(u),
      salePrice(u),
      // codes keep their left-to-right order inside the Persian line
      u.barcodes.length ? t('units.barcode', { code: '\u2066' + u.barcodes.join('، ') + '\u2069' }) : null,
    ]
      .filter(Boolean)
      .join(' · ');
  return { factor, uses, salePrice, details, qty, price };
}
