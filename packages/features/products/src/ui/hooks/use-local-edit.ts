'use client';
import { useRef, useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { useInvalidate, useQueryCache } from '@dukani/data';
import { isAppError, type AppError } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { localConflicts, localRequestApplied, toLocalRequest } from '../../domain/local-info';
import type { LocalInfoValues } from '../../domain/local-info.types';
import type { LocalEditState } from './use-local-edit.types';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

const asError = (e: unknown): AppError =>
  isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: String(e) };

/**
 * Saves the local name/note/service cost of one product (PRD-LOCAL-EDIT, F11 §5) with the version it was read at.
 * - 409: the fresh product is loaded and the differing fields are shown; the next save uses the fresh version;
 * - lost response: the product is read again and the save counts as done when the server already holds it;
 * - success: the canonical product replaces the cached one, then lists refresh.
 */
export function useLocalEdit(product: Dto<'StoreProductDto'>) {
  const store = useActiveStore();
  const { products } = useProductsModule();
  const cache = useQueryCache();
  const invalidate = useInvalidate();
  const keys = productKeys(store.id);
  const base = useRef(product);
  const lock = useRef(false);
  const [state, setState] = useState<LocalEditState>({ kind: 'idle' });

  const accept = async (fresh: Dto<'StoreProductDto'>) => {
    base.current = fresh;
    cache.set(keys.detail(fresh.id), fresh);
    setState({ kind: 'saved', product: fresh });
    // a failed list refresh never turns the confirmed save into a failure
    await Promise.resolve(invalidate(keys.list())).catch(() => undefined);
  };

  const save = async (values: LocalInfoValues): Promise<AppError | null> => {
    if (lock.current) return null;
    lock.current = true;
    const request = toLocalRequest(values, base.current);
    setState({ kind: 'saving' });
    try {
      await accept(await products.updateLocal(store.id, base.current.id, request));
      return null;
    } catch (e) {
      const error = asError(e);
      if (error.code === 'VERSION_CONFLICT' || error.kind === 'Unknown') {
        try {
          const fresh = await products.get(store.id, base.current.id);
          if (error.kind === 'Unknown' && localRequestApplied(fresh, request)) {
            await accept(fresh);
            return null;
          }
          base.current = fresh;
          cache.set(keys.detail(fresh.id), fresh);
          setState(
            error.kind === 'Unknown'
              ? { kind: 'unknown' }
              : { kind: 'conflict', fresh, fields: localConflicts(fresh, values) },
          );
        } catch {
          setState({ kind: 'unknown' });
        }
        return null;
      }
      setState({ kind: 'failed', error });
      return error;
    } finally {
      lock.current = false;
    }
  };

  return { state, save, saving: state.kind === 'saving' };
}
