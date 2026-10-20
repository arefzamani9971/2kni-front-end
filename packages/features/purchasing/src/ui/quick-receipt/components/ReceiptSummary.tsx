'use client';
import type { Dto } from '@dukani/contracts';
import { decimal, parseMoneyInput, parseQuantity, type Money } from '@dukani/domain';
import { useFieldValue } from '@dukani/forms';
import { KeyValueList, Section } from '@dukani/ui-kit';
import { lineAmountOf, receiptPreview } from '../../../domain/receipt';
import { usePurchasePresentation } from '../../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { ReceiptAppForm } from '../types/ReceiptForm.types';

const moneyOrNull = (raw: string): Money | null => {
  const r = parseMoneyInput(raw || '');
  return r.ok && raw.trim() ? r.value : null;
};

/**
 * «خلاصهٔ ورود» leaf: conversion to the base unit, the receipt amount and the cost of one base unit after the
 * charges — the same arithmetic as the server (Decimal). Only this leaf follows the typing.
 */
export function ReceiptSummary({ form, product }: { form: ReceiptAppForm; product: Dto<'StoreProductDto'> }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const [unitId, rawQty, costStatus, rawCost, discount, shipping, sideCharge] = [
    useFieldValue(form, 'unitId'),
    useFieldValue(form, 'quantity'),
    useFieldValue(form, 'costStatus'),
    useFieldValue(form, 'unitCost'),
    useFieldValue(form, 'discount'),
    useFieldValue(form, 'shipping'),
    useFieldValue(form, 'sideCharge'),
  ];
  const unit = product.units.find((u) => u.id === unitId);
  const qty = parseQuantity(rawQty || '', product.baseUnitMaxDecimals);
  if (!unit || !qty.ok) return null;
  const qtyBase = decimal.mul(qty.value, decimal.of(unit.baseQty));
  const amount = lineAmountOf(costStatus, moneyOrNull(rawCost), qty.value);
  const preview = receiptPreview(amount, qtyBase, {
    discount: moneyOrNull(discount),
    shipping: moneyOrNull(shipping),
    sideCharge: moneyOrNull(sideCharge),
  });
  const conversion = decimal.eq(decimal.of(unit.baseQty), decimal.of(1))
    ? `${presentation.qty(qtyBase)} ${product.baseUnitName}`
    : `${presentation.qty(qty.value)} ${unit.name} × ${presentation.qty(unit.baseQty)} = ${presentation.qty(qtyBase)} ${product.baseUnitName}`;
  return (
    <Section title={t('entrySummary')}>
      <KeyValueList
        items={[
          { label: t('receipt.quantityRow'), value: conversion },
          ...(preview.total
            ? [
                { label: t('receiptAmount'), value: presentation.money(preview.total) },
                {
                  label: t('receipt.costPerBase', { unit: product.baseUnitName }),
                  value: preview.costPerBase ? presentation.money(preview.costPerBase) : '—',
                },
              ]
            : [{ label: t('costStatus'), value: t('receipt.costUnknownSummary') }]),
        ]}
      />
    </Section>
  );
}
