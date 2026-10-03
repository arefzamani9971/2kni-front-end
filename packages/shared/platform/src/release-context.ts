'use client';
import { createContext } from 'react';
import type { ReleaseConfig } from './release-gate.types';

export const ReleaseContext = createContext<ReleaseConfig>({ current: '1.0', flags: [] });
