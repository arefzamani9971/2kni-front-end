'use client';
import { Alert, Button, DecimalField, TextField } from '@dukani/ui-kit';
import type { usePackageRows } from '../hooks/use-package-rows';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { PACKAGE_NAME_ERROR } from './CreateTypeForm.constants';

/** Suggested default packages of a product type, each error beside its own field. */
export function PackageRows({
  packages,
  maxDecimals,
  disabled,
}: {
  packages: ReturnType<typeof usePackageRows>;
  maxDecimals: number;
  disabled: boolean;
}) {
  const t = useCatalogTexts();
  const shown = (i: number) => (packages.showIssues ? packages.issues.rows[i] : undefined);
  return (
    <>
      {packages.rows.map((row, i) => {
        const issue = shown(i);
        return (
          <div
            key={row.key}
            className="bg-surface border-line desktop:flex-row flex flex-col gap-3 rounded-md border p-4"
          >
            <TextField
              label={t('packageName')}
              value={row.name}
              maxLength={80}
              disabled={disabled}
              status={issue?.name ? 'error' : undefined}
              message={issue?.name ? t(PACKAGE_NAME_ERROR[issue.name]) : undefined}
              onChange={(name) => packages.rename(row.key, name)}
            />
            <DecimalField
              label={t('baseQty')}
              value={row.baseQty}
              maxDecimals={maxDecimals}
              disabled={disabled}
              status={issue?.baseQty ? 'error' : undefined}
              message={issue?.baseQty ? t('packageQtyInvalid') : undefined}
              onChange={(baseQty) => packages.setQuantity(row.key, baseQty)}
            />
            <Button variant="secondary" type="button" disabled={disabled} onClick={() => packages.remove(row.key)}>
              {t('remove')}
            </Button>
          </div>
        );
      })}
      {packages.showIssues && packages.issues.tooMany ? (
        <Alert tone="danger" title={t('packagesTooMany')} />
      ) : null}
      <Button type="button" variant="secondary" disabled={!packages.canAdd || disabled} onClick={packages.add}>
        {t('addPackage')}
      </Button>
    </>
  );
}
