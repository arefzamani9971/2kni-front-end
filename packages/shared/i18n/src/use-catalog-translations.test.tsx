import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider, useCatalogTranslations, type Locale } from './index';
import { en, fa } from './catalogs';

type Catalog = { cancel: string };
type Translator = ReturnType<typeof useCatalogTranslations<Catalog>>;

const english: Catalog = { cancel: 'Cancel' };
const persian: Catalog = { cancel: 'لغو' };
const catalogs = { fa: persian, en: english };

function TranslationProbe({
  locale,
  messages,
  onRender,
}: {
  locale: Locale;
  messages: Record<Locale, Catalog>;
  onRender: (translator: Translator) => void;
}) {
  const t = useCatalogTranslations(messages);
  useEffect(() => {
    onRender(t);
  });
  return <span data-testid={locale}>{t('cancel')}</span>;
}

describe('useCatalogTranslations', () => {
  it('keeps t stable for a fresh container and changes to inactive messages', () => {
    const onRender = vi.fn<(translator: Translator) => void>();
    const { rerender } = render(
      <I18nProvider locale="en" messages={en}>
        <TranslationProbe locale="en" messages={{ ...catalogs }} onRender={onRender} />
      </I18nProvider>,
    );
    const original = onRender.mock.lastCall?.[0];
    expect(original).toBeTypeOf('function');

    rerender(
      <I18nProvider locale="en" messages={en}>
        <TranslationProbe locale="en" messages={{ ...catalogs }} onRender={onRender} />
      </I18nProvider>,
    );
    expect(onRender).toHaveBeenCalledTimes(2);
    expect(onRender.mock.lastCall?.[0]).toBe(original);

    rerender(
      <I18nProvider locale="en" messages={en}>
        <TranslationProbe
          locale="en"
          messages={{ fa: { cancel: 'انصراف' }, en: english }}
          onRender={onRender}
        />
      </I18nProvider>,
    );
    expect(onRender).toHaveBeenCalledTimes(3);
    expect(onRender.mock.lastCall?.[0]).toBe(original);
    expect(screen.getByTestId('en')).toHaveTextContent('Cancel');
  });

  it('refreshes t and its output when the active catalog or provider locale changes', () => {
    const onRender = vi.fn<(translator: Translator) => void>();
    const { rerender } = render(
      <I18nProvider locale="en" messages={en}>
        <TranslationProbe locale="en" messages={catalogs} onRender={onRender} />
      </I18nProvider>,
    );
    const original = onRender.mock.lastCall?.[0];
    const updated = { fa: persian, en: { cancel: 'Dismiss' } };

    rerender(
      <I18nProvider locale="en" messages={en}>
        <TranslationProbe locale="en" messages={updated} onRender={onRender} />
      </I18nProvider>,
    );
    const withUpdatedMessages = onRender.mock.lastCall?.[0];
    expect(withUpdatedMessages).not.toBe(original);
    expect(screen.getByTestId('en')).toHaveTextContent('Dismiss');

    rerender(
      <I18nProvider locale="fa" messages={fa}>
        <TranslationProbe locale="fa" messages={updated} onRender={onRender} />
      </I18nProvider>,
    );
    expect(onRender.mock.lastCall?.[0]).not.toBe(withUpdatedMessages);
    expect(screen.getByTestId('fa')).toHaveTextContent('لغو');
  });

  it('isolates simultaneous providers and their active catalog updates', () => {
    const onEnglishRender = vi.fn<(translator: Translator) => void>();
    const onPersianRender = vi.fn<(translator: Translator) => void>();
    const { rerender } = render(
      <>
        <I18nProvider locale="en" messages={en}>
          <TranslationProbe locale="en" messages={catalogs} onRender={onEnglishRender} />
        </I18nProvider>
        <I18nProvider locale="fa" messages={fa}>
          <TranslationProbe locale="fa" messages={catalogs} onRender={onPersianRender} />
        </I18nProvider>
      </>,
    );
    const englishTranslator = onEnglishRender.mock.lastCall?.[0];
    const persianTranslator = onPersianRender.mock.lastCall?.[0];

    rerender(
      <>
        <I18nProvider locale="en" messages={en}>
          <TranslationProbe
            locale="en"
            messages={{ fa: persian, en: { cancel: 'Dismiss' } }}
            onRender={onEnglishRender}
          />
        </I18nProvider>
        <I18nProvider locale="fa" messages={fa}>
          <TranslationProbe locale="fa" messages={{ ...catalogs }} onRender={onPersianRender} />
        </I18nProvider>
      </>,
    );
    expect(onEnglishRender.mock.lastCall?.[0]).not.toBe(englishTranslator);
    expect(onPersianRender.mock.lastCall?.[0]).toBe(persianTranslator);
    expect(screen.getByTestId('en')).toHaveTextContent('Dismiss');
    expect(screen.getByTestId('fa')).toHaveTextContent('لغو');
    expect(englishTranslator?.('cancel')).toBe('Cancel');
    expect(persianTranslator?.('cancel')).toBe('لغو');
  });
});
