'use client';
import { createContext } from 'react';
import type { LinkComponent } from './LinkProvider.types';

export const LinkContext = createContext<LinkComponent | null>(null);
