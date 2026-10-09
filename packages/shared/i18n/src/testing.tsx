import { render as renderReact, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';
import fa from './messages/fa.json';

/** Explicit default-locale wrapper for component tests; nested providers can test other locales. */
export function render(ui: ReactElement, options: RenderOptions = {}) {
  const Wrapper = options.wrapper;
  return renderReact(ui, {
    ...options,
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider locale="fa" messages={fa}>
        {Wrapper ? <Wrapper>{children}</Wrapper> : children}
      </I18nProvider>
    ),
  });
}
