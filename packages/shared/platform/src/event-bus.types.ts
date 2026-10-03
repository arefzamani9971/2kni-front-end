import type { AppEventMap, AppEventName } from '@dukani/domain';

export type Handler<E extends AppEventName> = (payload: AppEventMap[E]) => void;

/** Typed in-process pub/sub for cross-feature reactions (e.g. `product.created` → add cart line). */
export type EventBus = {
  emit<E extends AppEventName>(event: E, payload: AppEventMap[E]): void;
  on<E extends AppEventName>(event: E, handler: Handler<E>): () => void;
};
