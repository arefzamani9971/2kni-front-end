import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { ToastProvider } from '../src/feedback/Toast';
import './storybook.css';

function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'fa');
  }, [theme]);
  return (
    <ToastProvider>
      <div dir="rtl" className="min-h-full bg-canvas p-4 font-sans text-fg-primary">
        {children}
      </div>
    </ToastProvider>
  );
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeFrame theme={(ctx.globals.theme as string) ?? 'shop'}>
    <Story />
  </ThemeFrame>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Theme mode (Figma Semantic collection)',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'shop', title: 'فروشنده · Teal' },
          { value: 'customer', title: 'مشتری · Indigo' },
          { value: 'admin', title: 'ادمین · Slate' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'shop' },
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
    a11y: { test: 'error' },
    controls: { expanded: true },
    options: { storySort: { order: ['Foundations', 'Primitives', 'Fields', 'Date', 'Overlays', 'Feedback', 'Patterns', 'Shells'] } },
  },
};

export default preview;
