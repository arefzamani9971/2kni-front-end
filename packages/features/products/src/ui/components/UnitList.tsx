'use client';
import type { Dto } from '@dukani/contracts';
import { Alert, Button, FormScene, Section } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { UnitRow } from './UnitRow';

/**
 * UNIT-01 «واحد و بسته» of a store product (F12 §2): every unit — active ones first, retired ones after them «برای
 * سوابق» — with its factor to the base unit, uses and price. A page on mobile, a wide dialog on desktop. Actions
 * follow the permissions: add and archive with `product.manage`, uses and price with `price.change`.
 */
export function UnitList({
  product,
  onClose,
  onAdd,
  onEdit,
  onArchive,
}: {
  product: Dto<'StoreProductDto'>;
  onClose: () => void;
  onAdd?: () => void;
  onEdit?: (unit: Dto<'StoreProductUnitDto'>) => void;
  onArchive?: (unit: Dto<'StoreProductUnitDto'>) => void;
}) {
  const t = useProductTranslations();
  const base = product.baseUnitName;
  return (
    <FormScene
      open
      size="full"
      onOpenChange={(next) => (next ? undefined : onClose())}
      title={t('units.title')}
      description={product.title}
      actions={
        <>
          {onAdd ? (
            <Button block iconStart="plus" onClick={onAdd}>
              {t('units.add')}
            </Button>
          ) : null}
          <Button block variant="secondary" onClick={onClose}>
            {t('units.close')}
          </Button>
        </>
      }
    >
      <Alert tone="info" title={t('units.basis', { base })} description={t('units.factorRule')} />
      <Section title={t('units.listTitle')}>
        {product.units.map((unit) => {
          const active = !unit.archivedAt;
          return (
            <UnitRow
              key={unit.id}
              unit={unit}
              baseUnitName={base}
              onEdit={active && onEdit ? () => onEdit(unit) : undefined}
              onArchive={active && !unit.isBase && onArchive ? () => onArchive(unit) : undefined}
            />
          );
        })}
      </Section>
    </FormScene>
  );
}
