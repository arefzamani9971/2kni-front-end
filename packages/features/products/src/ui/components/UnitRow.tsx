'use client';
import type { Dto } from '@dukani/contracts';
import { Badge, Button, ListRow, Text } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useUnitPresentation } from '../i18n/use-unit-presentation';

/**
 * One unit of the product (UNIT-01): name with «واحد پایه» or «برای سوابق», then factor · uses · price · barcode.
 * A retired unit stays readable for history and takes no action; the base unit is neither edited here (its price is
 * the pricing rule's) nor archived (F12 §9).
 */
export function UnitRow({
  unit,
  baseUnitName,
  onEdit,
  onArchive,
}: {
  unit: Dto<'StoreProductUnitDto'>;
  baseUnitName: string;
  /** Absent without permission or for a unit that cannot change. */
  onEdit?: () => void;
  onArchive?: () => void;
}) {
  const t = useProductTranslations();
  const presentation = useUnitPresentation();
  return (
    <ListRow>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text as="span" variant="label-l" tone={unit.archivedAt ? 'secondary' : 'primary'}>
            {unit.name}
          </Text>
          {unit.isBase ? (
            <Badge tone="brand" size="sm">
              {t('units.base')}
            </Badge>
          ) : null}
          {unit.archivedAt ? (
            <Badge tone="neutral" appearance="outline" size="sm">
              {t('units.forHistory')}
            </Badge>
          ) : null}
        </div>
        <Text variant="body-s" tone="secondary">
          {presentation.details(unit, baseUnitName)}
        </Text>
        {onEdit || onArchive ? (
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <Button variant="text" iconStart="edit" onClick={onEdit}>
                {t('units.edit')}
              </Button>
            ) : null}
            {onArchive ? (
              <Button variant="text" iconStart="archive" onClick={onArchive}>
                {t('units.archive')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ListRow>
  );
}
