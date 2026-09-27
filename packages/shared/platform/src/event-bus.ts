import type { AppEventMap, AppEventName } from '@dukani/domain';

type Handler<E extends AppEventName> = (payload: AppEventMap[E]) => void;

/** Typed in-process pub/sub for cross-feature reactions (e.g. `product.created` → add cart line). */
export type EventBus = {
  emit<E extends AppEventName>(event: E, payload: AppEventMap[E]): void;
  on<E extends AppEventName>(event: E, handler: Handler<E>): () => void;
};

export const createEventBus = (): EventBus => {
  const handlers = new Map<AppEventName, Set<Handler<never>>>();
  return {
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => (h as Handler<typeof event>)(payload));
    },
    on(event, handler) {
      const set = handlers.get(event) ?? new Set();
      set.add(handler as Handler<never>);
      handlers.set(event, set);
      return () => set.delete(handler as Handler<never>);
    },
  };
};
