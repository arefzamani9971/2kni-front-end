'use client';
import { BrandSelection } from './BrandSelection';
import type { DetailsBrandSelectionProps } from '../types/DetailsBrandSelection.types';

/** Brand choice over the details form: a picked brand goes into the form, a new name to in-place creation. */
export function DetailsBrandSelection({ form, brands, onClose, onCreate }: DetailsBrandSelectionProps) {
  return (
    <BrandSelection
      value={form.getValues().brand}
      brands={brands.available}
      pending={brands.query.isPending}
      error={brands.query.error}
      retry={() => void brands.query.refetch()}
      onCancel={onClose}
      onSelect={(value) => {
        form.setValue('brand', value);
        onClose();
      }}
      onCreate={
        onCreate
          ? (name) => {
              onClose();
              onCreate(name);
            }
          : undefined
      }
    />
  );
}
