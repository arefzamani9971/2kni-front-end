import type { Dto } from '@dukani/contracts';
import type { AppError } from '@dukani/domain';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { ReceiptFormOutput, ReceiptFormValues } from '../../domain/receipt-form.types';
import type { ReceiptKind } from '../../domain/receipt.types';
import type { receiptSchemaFor } from './ReceiptForm.schema';

type ReceiptSchema = ReturnType<typeof receiptSchemaFor>;
/** The single-product receipt form, shared by its field sections and live summary leaves. */
export type ReceiptAppForm = AppForm<InferInput<ReceiptSchema>, Infer<ReceiptSchema>>;

export type ReceiptSectionProps = {
  readonly form: ReceiptAppForm;
  readonly product: Dto<'StoreProductDto'>;
  readonly kind: ReceiptKind;
  readonly disabled?: boolean;
};

/** What a screen may do with the mounted form: flush its draft before leaving, set a scanned unit. */
export type ReceiptFormHandle = {
  readonly flush: () => Promise<boolean>;
  readonly setUnit: (unitId: string) => void;
};

export type ReceiptFormProps = {
  readonly id: string;
  readonly kind: ReceiptKind;
  readonly product: Dto<'StoreProductDto'>;
  readonly initial: ReceiptFormValues;
  readonly disabled: boolean;
  readonly failed: AppError | null;
  readonly onSave: (values: ReceiptFormValues) => Promise<unknown>;
  readonly onSubmit: (values: ReceiptFormOutput) => Promise<void>;
  /** Stable callback. */
  readonly onReady: (handle: ReceiptFormHandle) => void;
};
