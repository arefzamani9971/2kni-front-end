import type { AppEventName } from '@dukani/domain';
import type { EventBus, Handler } from './event-bus.types';

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
