import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentColumns } from '../patterns/ContentColumns';
import { FormColumn } from '../patterns/FormColumn';
import { TwoColumnWorkspace } from '../patterns/TwoColumnWorkspace';
import { AuthShell } from './AuthShell';
import { FlowShell } from './FlowShell';
import { PageShell } from './PageShell';
import { ShellNavProvider } from './ShellNavProvider';

const NAV = [
  { id: 'home', label: 'خانه', icon: 'home', href: '/s/1/home' },
  { id: 'settings', label: 'تنظیمات', icon: 'settings', href: '/s/1/settings' },
] as const;

describe('FlowShell desktop sidebar (Figma 16 «Dukani/Desktop Sidebar»)', () => {
  it('renders the app sidebar with the active row marked by aria-current', () => {
    render(
      <ShellNavProvider
        items={[...NAV]}
        sidebarActiveId="settings"
        workspace="پنل فروشنده"
        sidebarFooter="فضای کاری دکانی"
      >
        <FlowShell appBar={{ title: 'اطلاعات فروشگاه' }}>محتوا</FlowShell>
      </ShellNavProvider>,
    );
    const nav = screen.getByRole('navigation', { name: 'ناوبری اصلی' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تنظیمات' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('پنل فروشنده')).toBeInTheDocument();
    expect(screen.getByText('فضای کاری دکانی')).toBeInTheDocument();
  });

  it('announces disabled destinations without exposing a navigable anchor', () => {
    render(
      <ShellNavProvider items={NAV.map((n) => ({ ...n, href: '#', disabled: true }))}>
        <FlowShell appBar={{ title: 'فروشگاه‌های من' }}>محتوا</FlowShell>
      </ShellNavProvider>,
    );
    expect(screen.getByRole('link', { name: 'خانه' })).not.toHaveAttribute('href');
    expect(screen.getByText('خانه').closest('[aria-disabled]')).not.toBeNull();
  });

  it('sign-in never shows the sidebar (Figma AUTH-* have none)', () => {
    render(
      <ShellNavProvider items={[...NAV]}>
        <AuthShell title="ورود به دکانی">فرم</AuthShell>
      </ShellNavProvider>,
    );
    expect(screen.queryByRole('navigation', { name: 'ناوبری اصلی' })).not.toBeInTheDocument();
  });
});

describe('PageShell header', () => {
  it('can drop the header when the title is part of the content (STORE-04 385:6853)', () => {
    render(
      <PageShell title="اطلاعات و تنظیمات" header={null}>
        <h1>اطلاعات و تنظیمات</h1>
      </PageShell>,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('can take a flush App Bar instead (STORE-05 385:6912)', () => {
    render(
      <PageShell title="ویرایش فروشگاه" header={<header>نوار</header>}>
        محتوا
      </PageShell>,
    );
    expect(screen.getByText('نوار')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ویرایش فروشگاه' })).not.toBeInTheDocument();
  });
});

describe('desktop layouts', () => {
  it('keeps one identity and form instance when the auth screen enters recovery', () => {
    const { rerender } = render(
      <AuthShell title="تأیید شماره" identity={<p>شمارهٔ انتخاب‌شده</p>}>
        <input aria-label="کد" defaultValue="012345" />
      </AuthShell>,
    );
    const input = screen.getByRole('textbox', { name: 'کد' });
    rerender(
      <AuthShell title="کد نادرست" recovery identity={<p>شمارهٔ انتخاب‌شده</p>} notice={{ title: 'خطای کد' }}>
        <input aria-label="کد" defaultValue="" />
      </AuthShell>,
    );
    expect(screen.getAllByText('شمارهٔ انتخاب‌شده')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'کد' })).toBe(input);
    expect(input).toHaveValue('012345');
    expect(screen.getByRole('alert')).toHaveTextContent('خطای کد');
  });

  it('uses the supplied introduction for both the brand panel and mobile introduction', () => {
    render(
      <AuthShell
        title="ورود"
        introduction="معرفی سفارشی"
        brand={{ name: 'دکانی', workspace: 'فروشنده', description: 'پیش‌فرض' }}
      >
        فرم
      </AuthShell>,
    );
    expect(screen.queryByText('پیش‌فرض')).not.toBeInTheDocument();
    expect(screen.getAllByText('معرفی سفارشی')).toHaveLength(2);
  });

  it('ContentColumns keeps the summary card for desktop only (Figma «Content columns»)', () => {
    render(<ContentColumns summary={<p>خلاصه</p>}>جزئیات</ContentColumns>);
    // a plain block, not a second complementary landmark (the sidebar is the page's only one)
    const aside = screen.getByText('خلاصه').parentElement!;
    expect(aside.tagName).toBe('DIV');
    expect(aside.className).toContain('hidden');
    expect(aside.className).toContain('desktop:flex');
    expect(screen.getByText('جزئیات')).toBeVisible();
  });

  it('TwoColumnWorkspace hides the secondary column on mobile unless asked', () => {
    const { rerender } = render(<TwoColumnWorkspace primary="اصلی" secondary="کمکی" />);
    expect(screen.getByText('کمکی').className).toContain('hidden');
    rerender(<TwoColumnWorkspace primary="اصلی" secondary="کمکی" secondaryOnMobile />);
    expect(screen.getByText('کمکی').className).not.toContain('hidden');
  });

  it('FormColumn caps the desktop form width (760 / 680) and lets `wide` content span the row', () => {
    const { rerender } = render(<FormColumn wide={<div>آپلود</div>}>فرم</FormColumn>);
    expect(screen.getByText('فرم').className).toContain('desktop:max-w-[760px]');
    expect(screen.getByText('آپلود').parentElement!.className).not.toContain('max-w');
    rerender(<FormColumn size="md">فرم</FormColumn>);
    expect(screen.getByText('فرم').className).toContain('desktop:max-w-[680px]');
  });
});
