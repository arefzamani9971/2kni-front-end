import type {
  BarcodeAliasRequest,
  BarcodeAliasConfirmation,
  BarcodeAliasPreview,
  BarcodeAliasResult,
} from '../domain/barcode-alias.types';
import type { OperationId } from '@dukani/domain';

export type BarcodeAliasIntent = {
  readonly schemaVersion: 1;
  readonly operationId: OperationId;
  readonly payload: BarcodeAliasConfirmation;
};
export type BarcodeAliases = {
  preview(storeId: string, productId: string, body: BarcodeAliasRequest): Promise<BarcodeAliasPreview>;
  commit(
    storeId: string,
    productId: string,
    body: BarcodeAliasConfirmation,
    operationId: OperationId,
  ): Promise<BarcodeAliasResult>;
};
export type BarcodeAliasDrafts = {
  readForm(storeId: string, productId: string): Promise<BarcodeAliasFormDraft | null>;
  writeForm(storeId: string, productId: string, draft: BarcodeAliasFormDraft): Promise<void>;
  removeForm(storeId: string, productId: string): Promise<void>;
  read(storeId: string, productId: string): Promise<BarcodeAliasIntent | null>;
  write(storeId: string, productId: string, intent: BarcodeAliasIntent): Promise<void>;
  remove(storeId: string, productId: string): Promise<void>;
};

export type BarcodeAliasFormDraft = {
  readonly schemaVersion: 1;
  readonly unitId: string;
  readonly barcode: string;
};
