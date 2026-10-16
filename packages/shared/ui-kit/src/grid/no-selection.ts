import { createSelectionStore } from './selection-store';

/**
 * Shared read-only stand-in when a grid has no selection, so row hooks stay unconditional. Nothing ever writes
 * to it: rows only render checkboxes when a real store is passed.
 */
export const NO_SELECTION = createSelectionStore();
