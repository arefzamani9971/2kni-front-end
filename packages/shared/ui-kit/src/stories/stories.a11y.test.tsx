/// <reference types="vite/client" />
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import type { ComponentType } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import preview from '../../.storybook/preview';

/**
 * Accessibility gate of ui-kit (CLAUDE.md: every component has a story and an a11y test): every Storybook story
 * is rendered with the real preview decorators and checked with axe-core. jsdom has no layout or colors, so
 * `color-contrast` is left to the Storybook a11y addon; `region` does not apply to isolated stories.
 * Location stories are skipped (Leaflet needs a real canvas).
 */
setProjectAnnotations(preview);

const modules = import.meta.glob<Record<string, unknown>>(['./*.stories.tsx', '!./Location.stories.tsx'], { eager: true });

const AXE_OPTIONS: axe.RunOptions = {
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
};

afterEach(cleanup);

for (const [file, mod] of Object.entries(modules)) {
  const stories = composeStories(mod as Parameters<typeof composeStories>[0]) as Record<string, ComponentType>;
  describe(file.replace('./', ''), () => {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${name} has no axe violations`, async () => {
        render(<Story />);
        const result = await axe.run(document.body, AXE_OPTIONS);
        const problems = result.violations.map(
          (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`,
        );
        expect(problems).toEqual([]);
      });
    }
  });
}
