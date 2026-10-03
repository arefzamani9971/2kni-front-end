'use client';
import { useContext } from 'react';
import { ReleaseContext } from './release-context';

export const useRelease = () => useContext(ReleaseContext);
