'use client';
import { createContext } from 'react';
import type { CatalogItemOpening } from '../hooks/catalog-item-opening.types';

/** Read by the row buttons only, so opening a row does not re-render the grid rows. */
export const CatalogItemOpeningContext = createContext<CatalogItemOpening | null>(null);
