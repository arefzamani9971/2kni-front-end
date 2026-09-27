import type { Meta, StoryObj } from '@storybook/react-vite';
import { IranMobileField } from '../fields/identity-fields';
import { Button } from '../primitives/Button';
import { MetricCard } from '../patterns/MetricCard';
import { ActionList, ListRow, Section } from '../patterns/Section';
import { AuthShell, TabsShell } from '../shells/shells';
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
