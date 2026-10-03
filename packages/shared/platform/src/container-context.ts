'use client';
import { createContext } from 'react';

/**
 * Dependency injection through React context. Each app builds its container once in its
 * composition root (repositories, http, session…) and features read what they need with
 * `useContainer<SellerContainer>()`. Tests pass a fake container.
 */
export const ContainerContext = createContext<unknown>(null);
