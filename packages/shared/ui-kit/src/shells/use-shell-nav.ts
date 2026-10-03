'use client';
import { useContext } from 'react';
import { ShellNavContext } from './shell-nav-context';

export const useShellNav = () => useContext(ShellNavContext);
