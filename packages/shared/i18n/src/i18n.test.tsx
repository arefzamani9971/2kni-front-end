import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useCatalogTranslations, useLocale, getDirection, resolveLocale } from './index';
import { fa, en } from './catalogs';

function Example() {
  const t = useCatalogTranslations({
    fa: { cancel: 'لغو', count: '{count, plural, one {# مورد} other {# مورد}}' },
    en: { cancel: 'Cancel', count: '{count, plural, one {# item} other {# items}}' },
  });
  return (
    <div dir={getDirection(useLocale())} data-testid="locale">
      <span>{t('cancel')}</span>
      <span>{t('count', { count: 2 })}</span>
    </div>
  );
}

describe('i18n contract', () => {
  it('switches messages, plural rules and direction without leaking locale between providers', () => {
    const { rerender } = render(
      <I18nProvider locale="fa" messages={fa}>
        <Example />
      </I18nProvider>,
    );
    expect(screen.getByText('لغو')).toBeInTheDocument();
    expect(screen.getByTestId('locale')).toHaveAttribute('dir', 'rtl');
    rerender(
      <I18nProvider locale="en" messages={en}>
        <Example />
      </I18nProvider>,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByTestId('locale')).toHaveAttribute('dir', 'ltr');
  });
  it('keeps both catalogs complete and defaults unsupported input to Persian', () => {
    const keys = (value: object, prefix = ''): string[] =>
      Object.entries(value).flatMap(([key, child]) =>
        typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
      );
    expect(keys(en).sort()).toEqual(keys(fa).sort());
    expect(resolveLocale('../../other')).toBe('fa');
  });
});
