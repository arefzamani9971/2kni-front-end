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

/** Reproduces Figma «AUTH-01 / ورود با شماره موبایل» (358:478). */
export const SellerLogin: StoryObj = {
  render: () => (
    <div className="-m-4">
      <AuthShell title="ورود به دکانی" back={() => undefined} actions={<Button block>دریافت کد ورود</Button>}>
        <p className="text-body-m text-fg-secondary">فروش، موجودی و حساب مشتریان فروشگاه شما</p>
        <IranMobileField defaultValue="09123456789" />
        <p className="text-body-m text-fg-secondary">
          کد ورود به همین شماره پیامک می‌شود.
          <br />
          با ادامه، شرایط استفاده و حریم خصوصی را می‌پذیرید.
        </p>
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
