import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from '../fields/Checkbox';
import { SearchField } from '../fields/SearchField';
import { SelectField } from '../fields/SelectField';
import { ActiveFilterChips } from '../filter/ActiveFilterChips';
import { FilterArea } from '../filter/FilterArea';
import { useFilterDraft } from '../filter/use-filter-draft';
import { CATEGORY_OPTIONS, DEFAULT_PRODUCT_FILTER, type ProductFilter } from './filter-story.fixtures';

/** PAT-FILTER-01: desktop collapsible panel, Primary «جست‌وجو» under every field; mobile search + filter sheet. */
const meta: Meta = { title: 'Patterns/FilterArea' };
export default meta;

function ProductFilters() {
  const [applied, setApplied] = useState<ProductFilter>({ ...DEFAULT_PRODUCT_FILTER, categoryId: 'pens' });
  const filter = useFilterDraft({ applied, defaults: DEFAULT_PRODUCT_FILTER, onApply: setApplied });
  const category = CATEGORY_OPTIONS.find((option) => option.value === applied.categoryId);
  return (
    <FilterArea
      appliedCount={filter.activeKeys.length}
      dirty={filter.dirty}
      onApply={filter.apply}
      onReset={filter.reset}
      options={
        <Checkbox
          label="فقط کالاهای موجود"
          checked={filter.draft.inStock}
          onChange={(inStock) => filter.set({ inStock })}
        />
      }
      search={<SearchField label="نام یا بارکد" value={filter.draft.q} onChange={(q) => filter.set({ q })} />}
      chips={
        <ActiveFilterChips
          items={category ? [{ key: 'categoryId', label: `دسته: ${category.label}` }] : []}
          onRemove={(key) => filter.remove(key as keyof ProductFilter)}
          onClearAll={filter.clearAll}
        />
      }
    >
      <SelectField
        label="دسته"
        value={filter.draft.categoryId}
        options={CATEGORY_OPTIONS}
        onChange={(categoryId) => filter.set({ categoryId })}
      />
    </FilterArea>
  );
}

export const Products: StoryObj = { render: () => <ProductFilters /> };
export const ProductsDesktop: StoryObj = { render: () => <ProductFilters />, globals: { device: 'desktop' } };
