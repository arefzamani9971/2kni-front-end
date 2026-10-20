import { StrictMode } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '@dukani/i18n/testing';
import { cropImage } from '@dukani/platform';
import { ImageEditor } from '../components/ImageEditor';

vi.mock('@dukani/platform', () => ({ cropImage: vi.fn() }));

const activeUrls = new Set<string>();
let nextUrl = 0;

beforeEach(() => {
  activeUrls.clear();
  nextUrl = 0;
  vi.stubGlobal(
    'URL',
    class extends URL {
      static override createObjectURL() {
        const url = `blob:preview-${++nextUrl}`;
        activeUrls.add(url);
        return url;
      }
      static override revokeObjectURL(url: string) {
        activeUrls.delete(url);
      }
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

it('keeps a live preview through StrictMode replay and releases every replaced or unmounted file', () => {
  const first = new File(['first'], 'first.png', { type: 'image/png' });
  const second = new File(['second'], 'second.png', { type: 'image/png' });
  const onApply = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <StrictMode>
      <ImageEditor file={first} onApply={onApply} onCancel={onCancel} />
    </StrictMode>,
  );
  const firstUrl = screen.getByRole('img').getAttribute('src');
  expect(activeUrls).toEqual(new Set([firstUrl]));

  view.rerender(
    <StrictMode>
      <ImageEditor file={second} onApply={onApply} onCancel={onCancel} />
    </StrictMode>,
  );
  const secondUrl = screen.getByRole('img').getAttribute('src');
  expect(secondUrl).not.toBe(firstUrl);
  expect(activeUrls).toEqual(new Set([secondUrl]));
  view.unmount();
  expect(activeUrls.size).toBe(0);
});

it('preserves crop input focus and submits the current file and rectangle', async () => {
  const file = new File(['source'], 'source.png', { type: 'image/png' });
  const cropped = new File(['cropped'], 'cropped.png', { type: 'image/png' });
  const onApply = vi.fn();
  const onCancel = vi.fn();
  vi.mocked(cropImage).mockResolvedValue(cropped);
  render(<ImageEditor file={file} onApply={onApply} onCancel={onCancel} />);
  const left = screen.getByRole('textbox', { name: 'فاصله از چپ (درصد)' });
  left.focus();
  fireEvent.change(left, { target: { value: '۱۲' } });
  expect(left).toHaveFocus();
  expect(activeUrls.size).toBe(1);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'برش و ذخیره' })));
  expect(cropImage).toHaveBeenLastCalledWith(file, { left: 12, top: 0, width: 100, height: 100 });
  expect(onApply).toHaveBeenCalledWith(cropped);
  fireEvent.click(screen.getByRole('button', { name: 'بازگشت' }));
  expect(onCancel).toHaveBeenCalledOnce();
});
