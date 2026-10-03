import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Alert } from '../feedback/Alert';
import { useToast } from '../feedback/use-toast';
import { IranMobileField } from '../fields/IranMobileField';
import { OptionList } from '../fields/OptionList';
import { SelectField } from '../fields/SelectField';
import { ConfirmDialog } from '../overlays/ConfirmDialog';
import { Overlay } from '../overlays/Overlay';
import { DesktopSidebar } from '../patterns/DesktopSidebar';
import { ListRow } from '../patterns/ListRow';
import { Section } from '../patterns/Section';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';
import { useViewport } from '../responsive';
import { PageShell } from '../shells/PageShell';
import { ShellNavProvider } from '../shells/ShellNavProvider';
import { SELLER_NAV } from './Patterns.stories';

/**
 * Figma components with `Viewport=Mobile|Desktop` variants. Switch the «Viewport» toolbar: the same story, same
 * props and same state render the other variant. Size/spacing differences come from CSS (`desktop:` + density
 * tokens); presentation differences (sheet ↔ dialog, sheet ↔ anchored listbox) come from Adaptive strategies.
 */
const meta: Meta = { title: 'Responsive' };
export default meta;

function ViewportBadge() {
  const vp = useViewport();
  return (
    <p className="text-label-s text-fg-secondary">
      Viewport فعلی: {vp === 'desktop' ? 'Desktop · کنترل ۴۰' : 'Mobile · کنترل ۴۸'}
    </p>
  );
}

const STORE_TYPES = [
  { value: 'stationery', label: 'نوشت‌افزار' },
  { value: 'cosmetics', label: 'آرایشی و بهداشتی' },
  { value: 'other', label: 'سایر' },
];

/** Figma `Button` 55:10 / `Button Desktop` 565:95 and `Option Item` 649:581 — one component, density from tokens. */
export const Density: StoryObj = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <ViewportBadge />
      <div className="flex flex-wrap gap-3">
        <Button>ادامه</Button>
        <Button disabled>ادامه</Button>
        <Button variant="secondary">ادامه</Button>
        <Button variant="secondary" disabled>
          ادامه
        </Button>
      </div>
      <OptionList
        label="نوع فروشگاه"
        value="stationery"
        onSelect={() => undefined}
        options={[...STORE_TYPES, { value: 'x', label: 'غیرفعال', disabled: true }]}
      />
    </div>
  ),
};

/** Figma `Dukani/Select` 649:666 — mobile bottom sheet, desktop listbox anchored to the field. */
export const Select: StoryObj = {
  render: function Render() {
    const [type, setType] = useState('');
    const [unit, setUnit] = useState('');
    return (
      <div className="bg-surface flex max-w-[392px] flex-col gap-4 rounded-sm p-4">
        <ViewportBadge />
        <SelectField
          label="نوع فروشگاه"
          placeholder="انتخاب نوع فروشگاه"
          value={type}
          onChange={setType}
          options={STORE_TYPES}
        />
        <SelectField
          label="واحد پایه"
          value={unit}
          onChange={setUnit}
          createAction={{ label: 'ساخت واحد جدید', onSelect: () => undefined }}
          options={['عدد', 'بسته', 'جعبه', 'کیلوگرم', 'گرم', 'لیتر', 'متر', 'برگ', 'جفت', 'دست'].map((l) => ({
            value: l,
            label: l,
          }))}
        />
        <SelectField
          label="نوع فروشگاه"
          options={STORE_TYPES}
          status="error"
          message="نوع فروشگاه را انتخاب کنید."
        />
        <SelectField label="نوع فروشگاه" options={STORE_TYPES} disabled />
      </div>
    );
  },
};

/** Figma `Confirmation Overlay` 633:347 and `Form Overlay` 633:494 through `Overlay`. */
export const Overlays: StoryObj = {
  render: function Render() {
    const [confirm, setConfirm] = useState(false);
    const [order, setOrder] = useState(false);
    const [reason, setReason] = useState('دیگر لازم ندارم');
    const [login, setLogin] = useState(false);
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <ViewportBadge />
        <Button variant="danger-secondary" onClick={() => setConfirm(true)}>
          لغو عضویت
        </Button>
        <Button variant="secondary" onClick={() => setOrder(true)}>
          لغو سفارش
        </Button>
        <Button onClick={() => setLogin(true)}>ورود و عضویت</Button>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="لغو عضویت در نوشت‌افزار آفتاب؟"
          description="این فروشگاه از «فروشگاه‌های عضو» حذف می‌شود و رضایت پیامک تبلیغاتی هم برداشته می‌شود."
          confirmLabel="لغو عضویت"
          destructive
          onConfirm={() => setConfirm(false)}
        >
          <Alert
            tone="info"
            title="خریدها و بدهی شما باقی می‌ماند"
            description="فاکتورها و مانده ۳۷٬۰۰۰ تومان همچنان در «خریدهای من» دیده می‌شود."
          />
        </ConfirmDialog>
        <ConfirmDialog
          open={order}
          onOpenChange={setOrder}
          title="لغو سفارش ۲۰۵۱؟"
          confirmLabel="لغو سفارش"
          destructive
          onConfirm={() => setOrder(false)}
        >
          <div className="flex flex-col gap-2">
            <p className="text-label-s text-fg-secondary">دلیل لغو</p>
            <div className="flex flex-wrap gap-2">
              {['دیگر لازم ندارم', 'موعد طولانی است', 'سفارش اشتباه'].map((r) => (
                <Chip key={r} selected={reason === r} onClick={() => setReason(r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
          <Alert
            tone="info"
            title="بیعانه تأییدشده برگشت داده می‌شود"
            description="۱۰۰٬۰۰۰ تومان طبق شرایط فروشگاه برگشت داده می‌شود."
          />
        </ConfirmDialog>
        <Overlay
          open={login}
          onOpenChange={setLogin}
          title="ورود و عضویت در این فروشگاه"
          description="برای افزودن «خودکار بیک آبی» به سبد، شماره همراه خود را تأیید کنید."
          actions={
            <>
              <Button block onClick={() => setLogin(false)}>
                دریافت کد ورود
              </Button>
              <Button block variant="secondary" onClick={() => setLogin(false)}>
                ادامه مرور بدون ورود
              </Button>
            </>
          }
        >
          <IranMobileField defaultValue="09123456789" />
        </Overlay>
      </div>
    );
  },
};

/** Figma `Dukani/Toast` 635:539 — mobile above the bottom navigation, desktop top corner; errors persist. */
export const Toasts: StoryObj = {
  render: function Render() {
    const toast = useToast();
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <ViewportBadge />
        <Button variant="secondary" onClick={() => toast('اطلاعات در حال به‌روزرسانی است', 'info')}>
          Info
        </Button>
        <Button variant="secondary" onClick={() => toast('تغییرات ذخیره شد', 'success')}>
          Success
        </Button>
        <Button variant="secondary" onClick={() => toast('اتصال اینترنت ضعیف است', 'warning')}>
          Warning
        </Button>
        <Button
          variant="danger-secondary"
          onClick={() => toast('ذخیره انجام نشد؛ دوباره تلاش کنید', 'error')}
        >
          Error (تا بستن می‌ماند)
        </Button>
      </div>
    );
  },
};

/** Figma `Desktop Sidebar` 498:563 + `Navigation Item` 565:54. */
export const Sidebar: StoryObj = {
  render: () => (
    <div className="-m-4 h-[640px]">
      <DesktopSidebar
        items={SELLER_NAV}
        activeId="products"
        workspace="پنل فروشنده"
        footer="فضای کاری دکانی"
      />
    </div>
  ),
};

/**
 * Page 18 «queue / بررسی پیشنهادهای کاتالوگ» / page 16 frames: the same PageShell is the mobile screen with a
 * bottom bar and — in Desktop — sidebar + 24px content + a row of persistent actions.
 */
export const Shell: StoryObj = {
  render: () => (
    <div className="-m-4">
      <ShellNavProvider
        items={SELLER_NAV}
        activeId="products"
        workspace="پنل فروشنده · نوشت‌افزار الف"
        sidebarFooter="فضای کاری دکانی"
      >
        <PageShell
          title="بررسی پیشنهادهای کاتالوگ"
          subtitle="دکانی · نوشت‌افزار الف"
          actions={
            <>
              <Button block>بررسی پیشنهاد</Button>
              <Button block variant="secondary">
                بازگشت
              </Button>
            </>
          }
        >
          <div className="desktop:grid-cols-[minmax(0,689fr)_minmax(0,439fr)] desktop:gap-gutter grid gap-4">
            <Section title="صف بررسی">
              <ListRow>مغایرت رنگ در بارکد بسته</ListRow>
              <ListRow>خودکار بیک قرمز مدل A</ListRow>
            </Section>
            <Section title="خودکار بیک قرمز مدل A">
              <ListRow>ثبت‌شده توسط نوشت‌افزار الف</ListRow>
              <ListRow>استفادهٔ خصوصی فعال · انتشار عمومی هنوز انجام نشده</ListRow>
            </Section>
          </div>
        </PageShell>
      </ShellNavProvider>
    </div>
  ),
};
