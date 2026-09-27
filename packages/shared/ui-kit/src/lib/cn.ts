import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the Dukani text styles so `text-heading-l` (size) and `text-fg-primary` (color) coexist.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-l', 'heading-xl', 'heading-l', 'heading-m', 'heading-s',
            'body-l', 'body-m', 'body-s', 'label-l', 'label-m', 'label-s', 'caption', 'numeric-l', 'numeric-m',
          ],
        },
      ],
    },
  },
});

/** Merges class names; later classes win (consumer overrides beat defaults). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
