'use client';
import { useEffect } from 'react';
import { decimal, normalizeTitle } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm, useValidationRules } from '@dukani/forms';
import {
  BarcodeField,
  Button,
  Checkbox,
  ConfirmDialog,
  DecimalField,
  FormScene,
  KeyValueList,
  Section,
  Text,
  TextField,
  useConfirmAction,
} from '@dukani/ui-kit';
import { UNIT_NAME_MAX } from '../../domain/units.constants';
import { useUnitCommand } from '../hooks/use-unit-command';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useUnitPresentation } from '../i18n/use-unit-presentation';
import { unitSchema } from './UnitForm.schema';
import type { UnitFormProps } from './UnitForm.types';
import { UnitFormStatus } from './UnitFormStatus';
import { UnitPriceField } from './UnitPriceField';

/**
 * UNIT-01 add/edit of one store unit (F12 §5, §8): a page on mobile and a dialog on desktop (FormScene, like the
 * local edit 312:9574 / 312:1499; Figma has no frame for this scene). A new unit takes name, factor, uses, an optional
 * price and barcode; an existing unit shows name and factor read-only (a used factor never changes; a new quantity is
 * a new unit) and edits uses and price. Saving is explicit; leaving with changes asks first.
 */
export function UnitForm({ product, unit, onDone }: UnitFormProps) {
  const t = useProductTranslations();
  const presentation = useUnitPresentation();
  const validationRules = useValidationRules();
  const mode = unit ? 'edit' : 'add';
  const command = useUnitCommand(product);
  const takenNames = product.units.filter((u) => !u.archivedAt).map((u) => normalizeTitle(u.name));
  const form = useAppForm({
    schema: unitSchema(t, { mode, maxDecimals: product.baseUnitMaxDecimals, takenNames }, validationRules),
    defaultValues: {
      name: unit?.name ?? '',
      baseQty: unit ? decimal.of(unit.baseQty) : '',
      isPurchasable: unit?.isPurchasable ?? true,
      isSellable: unit?.isSellable ?? true,
      salePrice: unit?.salePriceAmount ?? '',
      barcode: '',
    },
  });
  const leave = useConfirmAction(async () => onDone());
  const saved = command.state.kind === 'succeeded';
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);
  const failure = command.state.kind === 'failed' ? command.state.error : null;
  useEffect(() => {
    if (!failure || form.applyServerError(failure)) return;
    // the server's own rules land next to the field they are about
    if (failure.code === 'UNIT_DUPLICATE') form.setFieldError('name', t('units.nameDuplicate'));
    if (failure.code === 'BARCODE_DUPLICATE' || failure.code === 'BARCODE_INVALID')
      form.setFieldError('barcode', failure.message);
    if (failure.code === 'QUANTITY_INVALID') form.setFieldError('baseQty', failure.message);
  }, [failure, form, t]);

  const submit = form.handleSubmit(async (v) => {
    if (command.busy) return;
    // the base unit keeps the price it has: it is priced on the pricing page (F16)
    const salePriceAmount = unit?.isBase
      ? (unit.salePriceAmount ?? null)
      : v.isSellable && v.salePrice
        ? v.salePrice.amount
        : null;
    await command.submit(
      unit
        ? {
            kind: 'update',
            unitId: unit.id,
            body: {
              salePriceAmount,
              isSellable: v.isSellable,
              isPurchasable: v.isPurchasable,
              expectedVersion: product.version,
            },
          }
        : {
            kind: 'add',
            body: {
              name: v.name.trim(),
              baseQty: v.baseQty,
              salePriceAmount,
              barcode: v.barcode,
              isSellable: v.isSellable,
              isPurchasable: v.isPurchasable,
              expectedVersion: product.version,
            },
          },
    );
  });
  const back = () => (form.formState.isDirty && !saved ? leave.open() : onDone());

  return (
    <>
      <FormScene
        open
        onOpenChange={(next) => (next ? undefined : back())}
        title={unit ? t('units.editTitle', { name: unit.name }) : t('units.addTitle')}
        actions={
          <>
            <Button
              block
              loading={command.busy}
              disabled={command.busy || command.state.kind === 'unknown'}
              onClick={() => void submit()}
            >
              {t('units.save')}
            </Button>
            <Button block variant="secondary" disabled={command.busy} onClick={back}>
              {t('units.back')}
            </Button>
          </>
        }
      >
        <UnitFormStatus command={command} />
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <Section
            title={unit ? t('units.fixedTitle') : t('units.addTitle')}
            description={t('units.factorRule')}
            className="desktop:border-0 desktop:p-0"
          >
            {unit ? (
              <KeyValueList
                items={[
                  { label: t('units.name'), value: unit.name },
                  {
                    label: t('units.baseQty', { base: product.baseUnitName }),
                    value: presentation.qty(unit.baseQty),
                  },
                ]}
              />
            ) : (
              <div className="desktop:grid-cols-2 grid gap-4">
                <form.Field name="name">
                  {(f) => (
                    <TextField
                      {...f}
                      label={t('units.name')}
                      hint={t('units.nameHint')}
                      required
                      maxLength={UNIT_NAME_MAX}
                    />
                  )}
                </form.Field>
                <form.Field name="baseQty">
                  {(f) => (
                    <DecimalField
                      {...f}
                      label={t('units.baseQty', { base: product.baseUnitName })}
                      required
                      unit={product.baseUnitName}
                      maxDecimals={Math.min(3, product.baseUnitMaxDecimals)}
                    />
                  )}
                </form.Field>
              </div>
            )}
            <form.Field name="isPurchasable">
              {(f) => (
                <>
                  <Checkbox
                    id={f.id}
                    checked={f.value}
                    onChange={f.onChange}
                    label={t('units.purchasable')}
                  />
                  {f.message ? (
                    <Text variant="body-s" tone="danger" role="alert">
                      {f.message}
                    </Text>
                  ) : null}
                </>
              )}
            </form.Field>
            <form.Field name="isSellable">
              {(f) => <Checkbox checked={f.value} onChange={f.onChange} label={t('units.sellable')} />}
            </form.Field>
            <UnitPriceField form={form} unit={unit} />
            {unit ? null : (
              <form.Field name="barcode">
                {(f) => <BarcodeField {...f} label={t('units.barcodeLabel')} optional />}
              </form.Field>
            )}
          </Section>
        </form>
      </FormScene>
      <ConfirmDialog
        {...leave.dialog}
        title={t('units.leaveTitle')}
        description={t('units.leaveHint')}
        confirmLabel={t('units.leave')}
        cancelLabel={t('units.stay')}
        destructive
      />
    </>
  );
}
