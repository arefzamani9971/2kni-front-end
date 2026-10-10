'use client';
import type { ReactNode } from 'react';
import { createAdaptive } from '../responsive/adaptive';
import { cn } from '../lib/cn';
import { Section } from './Section';
type Props = { title: ReactNode; children: ReactNode; className?: string };
/** Figma attrs/brandnew 358:491, 358:5354, 594:6653, 597:4023: accordion on mobile, open section on desktop. */
function Accordion(props: Props) {
  return <Section {...props} collapsible className={props.className} />;
}
function Card(props: Props) {
  return <Section {...props} className={cn('gap-4 rounded-lg p-6', props.className)} />;
}
export const FormSection = createAdaptive<Props>('FormSection', { mobile: Accordion, desktop: Card });
