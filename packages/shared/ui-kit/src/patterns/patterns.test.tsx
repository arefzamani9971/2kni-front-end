import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { UploadArea } from '../fields/UploadArea';
import { NavCard } from './NavCard';
import { Section } from './Section';

describe('Section (Figma Form Accordion)', () => {
  it('collapses with aria-expanded and keeps the fields (and their values) mounted', () => {
    render(
      <Section collapsible title="تماس و نشانی">
        <input aria-label="ایمیل" defaultValue="shop@example.com" />
      </Section>,
    );
    const toggle = screen.getByRole('button', { name: 'تماس و نشانی' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('ایمیل')).not.toBeVisible();
    fireEvent.click(toggle);
    expect(screen.getByLabelText('ایمیل')).toHaveValue('shop@example.com');
  });
});

describe('UploadArea (Figma 593:231)', () => {
  beforeAll(() => {
    // jsdom has no object URLs (the preview thumbnail)
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });
  function Harness() {
    const [file, setFile] = useState<File | null>(null);
    return (
      <>
        <UploadArea title="عکس فروشگاه (اختیاری)" description="انتخاب یا تغییر تصویر فروشگاه" value={file} onChange={setFile} />
        <output data-testid="name">{file?.name ?? ''}</output>
      </>
    );
  }
  const input = () => screen.getByLabelText('عکس فروشگاه (اختیاری)', { selector: 'input' });

  it('accepts a JPG/PNG/WebP image and rejects other types with an announced message', () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { files: [new File(['%PDF'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('فقط تصویر JPG، PNG یا WebP مجاز است.');
    expect(screen.getByTestId('name')).toHaveTextContent('');
    fireEvent.change(input(), { target: { files: [new File(['x'], 'logo.png', { type: 'image/png' })] } });
    expect(screen.getByTestId('name')).toHaveTextContent('logo.png');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects an empty file', () => {
    render(<Harness />);
    fireEvent.change(input(), { target: { files: [new File([], 'empty.png', { type: 'image/png' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('فایل خالی است.');
  });
});

describe('NavCard', () => {
  it('without href or onClick it is a plain card, not a dead button', () => {
    render(<NavCard title="فروشگاه مهر" meta="دعوت به همکاری" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('فروشگاه مهر')).toBeInTheDocument();
  });
});
