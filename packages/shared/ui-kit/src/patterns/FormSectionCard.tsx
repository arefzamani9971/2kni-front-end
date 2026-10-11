'use client';
import { cn } from '../lib/cn';
import type { FormSectionProps } from './FormSection.types';
import { Section } from './Section';

/** Figma attrs/brandnew 358:5354, 597:4023: an always-open card section on desktop. */
export function FormSectionCard(props: FormSectionProps) {
  return <Section {...props} className={cn('gap-4 rounded-lg p-6', props.className)} />;
}
