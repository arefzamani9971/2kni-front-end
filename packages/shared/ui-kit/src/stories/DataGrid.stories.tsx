import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../primitives/Button';
import { GridCardList } from '../grid/GridCardList';
import { GridCard } from '../grid/GridCard';
import { DataGrid } from '../grid/DataGrid';
import { useLocalList } from '../grid/use-local-list';
import { useSelection } from '../grid/use-selection';
import {
  frozenSource,
  STORY_COLUMNS,
  STORY_PRODUCTS,
  storyRowActions,
  storyRowHref,
  storyRowId,
  storyRowLabel,
  storySortValue,
  type StorySort,
} from './grid-story.fixtures';

/**
 * Figma Responsive Record List 652:762/805, Data Grid Row 651:628, Record Card 651:679. One column definition:
 * table + pager on desktop, project cards + infinite scroll on mobile. Toggle «Viewport» in the toolbar.
 */
const meta: Meta = { title: 'Patterns/DataGrid' };
export default meta;

function ProductsGrid({ desktopVariant = 'separated' }: { desktopVariant?: 'separated' | 'table' }) {
  const source = useLocalList(STORY_PRODUCTS, { sortValue: storySortValue });
  const selection = useSelection();
  return (
    <DataGrid<(typeof STORY_PRODUCTS)[number], StorySort>
      source={source}
      desktopVariant={desktopVariant}
      columns={STORY_COLUMNS}
      getRowId={storyRowId}
      getRowLabel={storyRowLabel}
      getRowHref={storyRowHref}
      label="کالاهای فروشگاه"
      unit="کالا"
      selection={selection}
      rowActions={storyRowActions}
      bulkActions={
        <Button variant="secondary" size="sm">
          بایگانی
        </Button>
      }
      onSelectAllResults={async () => STORY_PRODUCTS.map((p) => p.id)}
    />
  );
}

export const Products: StoryObj = { render: () => <ProductsGrid /> };
export const ProductsDesktop: StoryObj = { render: () => <ProductsGrid />, globals: { device: 'desktop' } };

function ReadOnlyGrid() {
  const source = useLocalList(STORY_PRODUCTS.slice(0, 8), { sortValue: storySortValue });
  return (
    <DataGrid
      source={source}
      columns={STORY_COLUMNS}
      getRowId={storyRowId}
      getRowLabel={storyRowLabel}
      label="کالاهای فروشگاه"
      unit="کالا"
    />
  );
}

export const ReadOnlyDesktop: StoryObj = { render: () => <ReadOnlyGrid />, globals: { device: 'desktop' } };

const stateGrid = (status: 'loading' | 'error' | 'ready') => () => (
  <DataGrid
    source={frozenSource(status)}
    columns={STORY_COLUMNS}
    getRowId={storyRowId}
    getRowLabel={storyRowLabel}
    label="کالاهای فروشگاه"
    unit="کالا"
  />
);

export const LoadingDesktop: StoryObj = { render: stateGrid('loading'), globals: { device: 'desktop' } };
export const LoadingMobile: StoryObj = { render: stateGrid('loading') };
export const Empty: StoryObj = { render: stateGrid('ready') };
export const Failed: StoryObj = { render: stateGrid('error'), globals: { device: 'desktop' } };

const LONG_ROWS = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  row: { ...STORY_PRODUCTS[index % STORY_PRODUCTS.length]!, id: String(index), title: 'کالا ' + (index + 1) },
}));
export const LongMobileList: StoryObj = {
  render: () => (
    <div className="h-[640px] overflow-y-auto" data-testid="card-scroller">
      <GridCardList rows={LONG_ROWS} label="هزار کالا" busy={false}>
        {(row, id) => (
          <GridCard
            row={row}
            rowId={id}
            rowLabel={row.title}
            columns={STORY_COLUMNS}
            selectable
            rowActions={storyRowActions}
          />
        )}
      </GridCardList>
    </div>
  ),
};

export const TableDesktop: StoryObj = {
  render: () => <ProductsGrid desktopVariant="table" />,
  globals: { device: 'desktop' },
};
