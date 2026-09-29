import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { ToastProvider } from '../src/feedback/Toast';
import { ViewportProvider, type Viewport } from '../src/responsive';
import './storybook.css';

function ThemeFrame({ theme, device, children }: { theme: string; device: Viewport; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'fa');
  }, [theme]);
  return (
    <ViewportProvider forced={device}>
      <ToastProvider>
        <div dir="rtl" className="min-h-full bg-canvas p-4 font-sans text-fg-primary">
          {children}
        </div>
      </ToastProvider>
    </ViewportProvider>
  );
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeFrame theme={(ctx.globals.theme as string) ?? 'shop'} device={(ctx.globals.device as Viewport) ?? 'mobile'}>
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
    device: {
      description: 'Figma Viewport variant — drives ViewportProvider, density tokens and the desktop: variant',
      toolbar: {
        title: 'Viewport',
        icon: 'mobile',
        items: [
          { value: 'mobile', title: 'Mobile · 390', icon: 'mobile' },
          { value: 'desktop', title: 'Desktop · 1440', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'shop', device: 'mobile' },
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
    a11y: { test: 'error' },
    controls: { expanded: true },
    options: { storySort: { order: ['Foundations', 'Responsive', 'Primitives', 'Fields', 'Date', 'Overlays', 'Feedback', 'Patterns', 'Shells'] } },
  },
};

export default preview;
