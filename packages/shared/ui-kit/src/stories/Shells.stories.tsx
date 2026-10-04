import type { Meta, StoryObj } from '@storybook/react-vite';
import { IranMobileField } from '../fields/IranMobileField';
import { Button } from '../primitives/Button';
import { MetricCard } from '../patterns/MetricCard';
import { ActionList } from '../patterns/ActionList';
import { ListRow } from '../patterns/ListRow';
import { Section } from '../patterns/Section';
import { AuthShell } from '../shells/AuthShell';
import { TabsShell } from '../shells/TabsShell';
import { PageShell } from '../shells/PageShell';
import { ShellNavProvider } from '../shells/ShellNavProvider';
import { ButtonLink } from '../primitives/ButtonLink';
import { SELLER_NAV } from './Patterns.stories';
import { ContentColumns } from '../patterns/ContentColumns';
import { FormColumn } from '../patterns/FormColumn';
import { INLINE_ACTION } from '../patterns/FormColumn.constants';
import { ProductDataRow } from '../patterns/ProductDataRow';
import { TwoColumnWorkspace } from '../patterns/TwoColumnWorkspace';
import { FlowShell } from '../shells/FlowShell';
import { TextField } from '../fields/TextField';

const meta: Meta = { title: 'Shells', parameters: { layout: 'fullscreen' } };
export default meta;

/** Reproduces Figma «home / امروز در فروشگاه» (312:8673) with ui-kit components only. */
export const SellerHome: StoryObj = {
  render: () => (
    <div className="-m-4">
      <TabsShell title="امروز در فروشگاه" subtitle="دکانی · نوشت‌افزار آفتاب" nav={SELLER_NAV} activeNav="home">
        <div className="flex gap-3">
          <MetricCard label="فروش امروز" value="۱٬۰۰۰٬۰۰۰" unit="تومان" />
          <MetricCard label="دریافت امروز" value="۸۰۰٬۰۰۰" unit="تومان" />
        </div>
        <Section title="کارهای روزانه">
          <ActionList>
            {['ثبت فروش', 'افزودن کالا', 'کالا و موجودی', 'مشتریان و بدهی', 'گزارش‌ها'].map((l) => (
              <Button key={l} block variant="secondary">{l}</Button>
            ))}
          </ActionList>
        </Section>
        <Section title="نیازمند توجه">
          <ListRow>۳ کالا نزدیک اتمام</ListRow>
          <ListRow>۲ کالا با بهای نامعلوم</ListRow>
          <Button block variant="secondary">مشاهده کمبودها</Button>
        </Section>
      </TabsShell>
    </div>
  ),
};

/** Reproduces Figma «AUTH-01 / ورود با شماره موبایل» (358:478; desktop 358:5341 — lead + note in the side card). */
export const SellerLogin: StoryObj = {
  render: () => (
    <div className="-m-4">
      <AuthShell
        title="ورود به دکانی"
        back={() => undefined}
        actions={<Button block>دریافت کد ورود</Button>}
        lead={<p>فروش، موجودی و حساب مشتریان فروشگاه شما</p>}
        note={
          <p>
            کد ورود به همین شماره پیامک می‌شود.
            <br />
            با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیرید.
          </p>
        }
      >
        <IranMobileField defaultValue="09123456789" />
      </AuthShell>
    </div>
  ),
};

/** Page 17 flow frame: header with store subtitle, persistent actions and the app-provided navigation. */
export const EntryFlowPage: StoryObj = {
  render: () => (
    <div className="-m-4">
      <ShellNavProvider items={SELLER_NAV} activeId="home">
        <PageShell
          title="افزودن کالا"
          subtitle="دکانی · نوشت‌افزار آفتاب"
          actions={
            <Button variant="secondary" block>
              بازگشت
            </Button>
          }
        >
          <Section title="روش‌های دیگر">
            <ButtonLink href="#scan">اسکن بارکد</ButtonLink>
            <ButtonLink href="#new">ثبت کالای جدید</ButtonLink>
          </Section>
        </PageShell>
      </ShellNavProvider>
    </div>
  ),
};

/** App Bar variant (purchaselist, totals, detail). */
export const ListPageWithBack: StoryObj = {
  render: () => (
    <div className="-m-4">
      <ShellNavProvider items={SELLER_NAV} activeId="more">
        <PageShell title="خریدها" back={() => undefined} actions={<Button block>ثبت خرید</Button>}>
          <ListRow>رسید ۱۲ · پخش مهر</ListRow>
        </PageShell>
      </ShellNavProvider>
    </div>
  ),
};

/** Figma 16 sidebar (498:563): nine text rows, «دکانی / پنل فروشنده», footer «فضای کاری دکانی». */
const SIDEBAR = [
  { id: 'home', label: 'خانه', icon: 'home', href: '#' },
  { id: 'sale', label: 'فروش کالا و خدمت', icon: 'cart', href: '#' },
  { id: 'products', label: 'کالاهای فروشگاه', icon: 'products', href: '#' },
  { id: 'inventory', label: 'موجودی', icon: 'list', href: '#' },
  { id: 'services', label: 'خدمات و میان‌بر', icon: 'print', href: '#' },
  { id: 'customers', label: 'مشتریان', icon: 'customers', href: '#' },
  { id: 'checks', label: 'چک‌های دریافتی', icon: 'receipt', href: '#' },
  { id: 'reports', label: 'گزارش‌ها', icon: 'reports', href: '#' },
  { id: 'settings', label: 'تنظیمات', icon: 'settings', href: '#' },
] as const;

/** Desktop «Content columns» (storeselect 358:5343): Product Data Rows + 340px Summary card, sidebar at the end edge. */
export const DesktopContentColumns: StoryObj = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
  render: () => (
    <div className="-m-4">
      <ShellNavProvider items={[...SIDEBAR]} sidebarActiveId="settings" workspace="پنل فروشنده" sidebarFooter="فضای کاری دکانی">
        <FlowShell appBar={{ title: 'فروشگاه‌های من', back: () => undefined }} actions={<Button block>ثبت فروشگاه</Button>}>
          <ContentColumns
            summary={
              <>
                <h2 className="text-heading-m text-fg-primary">فروشگاه‌های من</h2>
                <p>نوشت‌افزار آفتاب</p>
                <Button className="self-start">ثبت فروشگاه</Button>
              </>
            }
          >
            <ProductDataRow href="#" title="نوشت‌افزار آفتاب" subtitle="مالک · فروشگاه پیش‌فرض" meta="ورود به پنل" metaTone="warning" />
            <ProductDataRow onClick={() => undefined} title="فروشگاه مهر" subtitle="دعوت به همکاری" meta="مشاهده دعوت" metaTone="warning" />
          </ContentColumns>
        </FlowShell>
      </ShellNavProvider>
    </div>
  ),
};

/** Desktop «Two-column workspace» (setup 312:208): Primary 693 at the start edge, Secondary 443 at the end edge. */
export const DesktopTwoColumnWorkspace: StoryObj = {
  render: () => (
    <TwoColumnWorkspace
      primary={
        <Section title="اطلاعات فروشگاه">
          <TextField label="نام فروشگاه" required defaultValue="نوشت‌افزار آفتاب" />
        </Section>
      }
      secondary={
        <Section title="آمادهٔ شروع">
          <ListRow>کالا را جست‌وجو یا خودتان ثبت کنید.</ListRow>
          <ListRow>برای شروع نیازی به ساخت دسته‌بندی ندارید.</ListRow>
        </Section>
      }
    />
  ),
};

/** Desktop form column (storeprofile 358:5344): wide upload row, 760px form group, label-sized actions. */
export const DesktopFormColumn: StoryObj = {
  render: () => (
    <FormColumn size="lg" wide={<Section title="عکس فروشگاه (اختیاری)" description="انتخاب یا تغییر تصویر فروشگاه" />}>
      <Section collapsible title="تماس و نشانی">
        <TextField label="تلفن تماس عمومی" optional placeholder="شماره تماس فروشگاه" />
      </Section>
      <Button variant="secondary" block className={INLINE_ACTION}>
        موقعیت فروشگاه (اختیاری)
      </Button>
    </FormColumn>
  ),
};
