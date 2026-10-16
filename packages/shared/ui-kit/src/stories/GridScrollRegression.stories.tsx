import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GridCardList } from '../grid/GridCardList';
import { GridCard } from '../grid/GridCard';
import { useInView } from '../grid/use-in-view';
import { STORY_COLUMNS, STORY_PRODUCTS } from './grid-story.fixtures';

const meta: Meta = { title: 'Patterns/GridScrollRegression' };
export default meta;
const rows = Array.from({ length: 240 }, (_, i) => ({
  id: String(i),
  row: { ...STORY_PRODUCTS[i % STORY_PRODUCTS.length]!, id: String(i), title: `کالا ${i + 1}` },
}));
function Incremental({ documentScroll = false }: { documentScroll?: boolean }) {
  const [count, setCount] = useState(200);
  return (
    <>
      <button data-testid="append-page" onClick={() => setCount((n) => n + 20)}>
        صفحه بعد
      </button>
      <main data-testid="scroll-root" className={documentScroll ? '' : 'h-[640px] overflow-y-auto'}>
        <div className="h-24">فهرست کالاها</div>
        <GridCardList rows={rows.slice(0, count)} label="کالاها" busy={false}>
          {(row, id) => (
            <GridCard row={row} rowId={id} rowLabel={row.title} columns={STORY_COLUMNS} selectable />
          )}
        </GridCardList>
      </main>
    </>
  );
}
function EarlyLoad({ documentScroll = false }: { documentScroll?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>('0px 0px 1200px 0px');
  return (
    <main data-testid="scroll-root" className={documentScroll ? '' : 'h-[640px] overflow-y-auto'}>
      <div className="h-[2400px]">اقلام صفحه اول</div>
      <div ref={ref} data-testid="sentinel">
        {inView ? 'load-next' : 'waiting'}
      </div>
      <div className="h-[1000px]" />
    </main>
  );
}
export const AppendInMain: StoryObj = { render: () => <Incremental /> };
export const AppendInDocument: StoryObj = { render: () => <Incremental documentScroll /> };
export const EarlyInMain: StoryObj = { render: () => <EarlyLoad /> };
export const EarlyInDocument: StoryObj = { render: () => <EarlyLoad documentScroll /> };
