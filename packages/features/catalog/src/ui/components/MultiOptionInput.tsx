'use client';
import { Chip, ChipGroup } from '@dukani/ui-kit';
import { splitKeys } from '../../domain/correction';
import type { CorrectionValueInputProps } from './CorrectionValueInput.types';

/** Several option keys of one attribute (MultiOption); the value is the keys joined by commas. */
export function MultiOptionInput({
  field,
  value,
  onChange,
  disabled,
  label,
  message,
}: CorrectionValueInputProps) {
  const keys = splitKeys(value);
  const toggle = (key: string) =>
    onChange((keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]).join(','));
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label-s text-fg-primary">{label}</span>
      <ChipGroup label={typeof label === 'string' ? label : undefined}>
        {field.allowedValues.map((option) => (
          <Chip
            key={option.value}
            selected={keys.includes(option.value)}
            disabled={disabled}
            onClick={() => toggle(option.value)}
          >
            {option.name}
          </Chip>
        ))}
      </ChipGroup>
      {message ? (
        <p role="alert" className="text-caption text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
