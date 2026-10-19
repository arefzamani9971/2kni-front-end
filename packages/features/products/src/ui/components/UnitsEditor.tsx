'use client';
import { useCallback, useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { useCan } from '@dukani/platform';
import { Alert, ConfirmDialog, useAppErrorMessage, useConfirmAction } from '@dukani/ui-kit';
import { useUnitArchive } from '../hooks/use-unit-archive';
import { useProductTranslations } from '../i18n/use-product-translations';
import { UnitForm } from './UnitForm';
import type { UnitsScene } from './UnitsEditor.types';
import { UnitList } from './UnitList';

/**
 * The units scene of a loaded, active good (F12 §2, §5, §8, §9): the list, the add or edit form, and the archive
 * confirmation that names the effect on records. A unit retired meanwhile closes its edit form and the list shows
 * it «برای سوابق».
 */
export function UnitsEditor({ product, onClose }: { product: Dto<'StoreProductDto'>; onClose: () => void }) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const canManage = useCan('product.manage');
  const canPrice = useCan('price.change');
  const [scene, setScene] = useState<UnitsScene>({ kind: 'list' });
  const toList = useCallback(() => setScene({ kind: 'list' }), []);
  const archive = useConfirmAction(useUnitArchive(product));
  const editing =
    scene.kind === 'edit' ? product.units.find((u) => u.id === scene.unitId && !u.archivedAt) : undefined;

  return (
    <>
      {scene.kind === 'add' ? (
        <UnitForm key="add" product={product} onDone={toList} />
      ) : editing ? (
        <UnitForm key={editing.id} product={product} unit={editing} onDone={toList} />
      ) : (
        <UnitList
          product={product}
          onClose={onClose}
          onAdd={canManage ? () => setScene({ kind: 'add' }) : undefined}
          onEdit={canPrice ? (unit) => setScene({ kind: 'edit', unitId: unit.id }) : undefined}
          onArchive={canManage ? archive.open : undefined}
        />
      )}
      <ConfirmDialog
        {...archive.dialog}
        title={t('units.archiveTitle', { name: archive.target?.name ?? '' })}
        description={t('units.archiveHint')}
        confirmLabel={t('units.archive')}
        cancelLabel={t('units.cancel')}
        destructive
      >
        {archive.error ? (
          <Alert tone="danger" title={t('units.archiveFailed')} description={errorMessage(archive.error)} />
        ) : null}
      </ConfirmDialog>
    </>
  );
}
