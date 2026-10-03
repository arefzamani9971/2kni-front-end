'use client';
import { useContext } from 'react';
import { LinkContext } from './link-context';

/** The injected router link, or null when the app did not provide one. */
export const useLinkComponent = () => useContext(LinkContext);
