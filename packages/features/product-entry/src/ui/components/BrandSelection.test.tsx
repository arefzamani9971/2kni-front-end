import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@dukani/i18n/testing';
import { ViewportProvider } from '@dukani/ui-kit';
import type { Dto } from '@dukani/contracts';
import { BrandSelection } from './BrandSelection';
const brands: Dto<'BrandDto'>[] = [
  { id: 'paper', name: 'کاغذ ایران', nameEn: 'Iran Paper', status: 'Public' },
  { id: 'old', name: 'کاغذ قدیم', nameEn: null, status: 'Archived' },
];
const setup = () => {
  const onCreate = vi.fn();
  const onSelect = vi.fn();
  render(
    <ViewportProvider forced="desktop">
      <BrandSelection
        value=""
        brands={brands}
        pending={false}
        error={null}
        retry={() => {}}
        onSelect={onSelect}
        onCreate={onCreate}
        onCancel={() => {}}
      />
    </ViewportProvider>,
  );
  return { onCreate, onSelect };
};
it('finds a brand typed with Arabic ی/ک and hides archived brands', async () => {
  setup();
  await userEvent.type(screen.getByRole('searchbox'), 'كاغذ');
  expect(screen.getByRole('button', { name: 'کاغذ ایران' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'کاغذ قدیم' })).toBeNull();
});
it('selects the existing brand instead of creating a normalized duplicate', async () => {
  const { onCreate } = setup();
  await userEvent.type(screen.getByRole('searchbox'), ' كاغذ  ايران ');
  await userEvent.click(screen.getByRole('button', { name: /کاغذ ایران.*موجود/ }));
  expect(onCreate).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'کاغذ ایران', pressed: true })).toBeInTheDocument();
});
it('creates a new brand when no normalized match exists', async () => {
  const { onCreate } = setup();
  await userEvent.type(screen.getByRole('searchbox'), 'برند تازه');
  await userEvent.click(screen.getByRole('button', { name: 'افزودن برند' }));
  expect(onCreate).toHaveBeenCalledWith('برند تازه');
});
