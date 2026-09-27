import type { Brand } from './brand';

export type Uuid = Brand<string, 'Uuid'>;
export type StoreId = Brand<string, 'StoreId'>;
export type OperationId = Brand<string, 'OperationId'>;

const hex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * UUIDv7 (time ordered, RFC 9562), like the backend `Guid.CreateVersion7()`.
 * Used for Idempotency-Key operation ids and client-created draft ids.
 */
export const newUuid = (now: number = Date.now()): Uuid => {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  const ts = BigInt(now);
  for (let i = 0; i < 6; i++) bytes[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const h = hex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` as Uuid;
};

/** One id per user action; retries of the same action MUST reuse it (P11). */
export const newOperationId = (): OperationId => newUuid() as string as OperationId;

export const isUuid = (s: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
