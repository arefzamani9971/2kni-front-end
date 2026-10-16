'use client';
import { useId } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';

/** «تعداد در صفحه»: a native select (four options, keyboard and screen-reader friendly, no overlay to mount). */
export function PageSizeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: readonly number[];
  onChange: (pageSize: number) => void;
}) {
  const t = useUiTranslations();
  const id = useId();
  return (
    <span className="flex items-center gap-2">
      <label htmlFor={id} className="text-body-s text-fg-secondary whitespace-nowrap">
        {t('grid.pageSize')}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="border-line bg-surface text-body-m text-fg-primary focus-visible:outline-focus h-10 rounded-md border px-2 focus-visible:outline-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t('grid.number', { value: option })}
          </option>
        ))}
      </select>
    </span>
  );
}
