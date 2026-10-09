import { I18nProvider, resolveLocale, getDirection, type Locale } from '@dukani/i18n';
import { fa, en } from '@dukani/i18n/catalogs';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { ToastProvider } from '../src/feedback/Toast';
import { ViewportProvider, type Viewport } from '../src/responsive';
import './storybook.css';

function ThemeFrame({
  theme,
  device,
  locale,
  children,
}: {
  theme: string;
  device: Viewport;
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', getDirection(locale));
    document.documentElement.setAttribute('lang', locale);
  }, [theme, locale]);
  return (
    <I18nProvider locale={locale} messages={locale === 'fa' ? fa : en}>
      <ViewportProvider forced={device}>
        <ToastProvider>
          <div dir={getDirection(locale)} className="bg-canvas text-fg-primary min-h-full p-4 font-sans">
            {children}
          </div>
        </ToastProvider>
      </ViewportProvider>
    </I18nProvider>
  );
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeFrame
    locale={resolveLocale(ctx.globals.locale)}
    theme={(ctx.globals.theme as string) ?? 'shop'}
    device={(ctx.globals.device as Viewport) ?? 'mobile'}
  >
    <Story />
  </ThemeFrame>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    locale: {
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'fa', title: 'فارسی' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
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
      description:
        'Figma Viewport variant — drives ViewportProvider, density tokens and the desktop: variant',
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
  initialGlobals: { theme: 'shop', device: 'mobile', locale: 'fa' },
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
    a11y: { test: 'error' },
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          'Foundations',
          'Responsive',
          'Primitives',
          'Fields',
          'Date',
          'Overlays',
          'Feedback',
          'Patterns',
          'Shells',
        ],
      },
    },
  },
};

export default preview;
