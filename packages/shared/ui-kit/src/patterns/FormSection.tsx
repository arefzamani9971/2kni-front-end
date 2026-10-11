'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { FormSectionProps } from './FormSection.types';
import { FormSectionCard } from './FormSectionCard';
import { FormSectionAccordion } from './FormSectionAccordion';

/** Figma attrs/brandnew 358:491, 358:5354, 594:6653, 597:4023: accordion on mobile, open section on desktop. */
export const FormSection = createAdaptive<FormSectionProps>('FormSection', {
  mobile: FormSectionAccordion,
  desktop: FormSectionCard,
});
