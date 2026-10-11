'use client';
import type { FormSectionProps } from './FormSection.types';
import { Section } from './Section';

/** Figma attrs/brandnew 358:491, 594:6653: a collapsible section on mobile. */
export function FormSectionAccordion(props: FormSectionProps) {
  return <Section {...props} collapsible className={props.className} />;
}
