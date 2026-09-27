import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../primitives/Badge';
import { Button, ButtonLink } from '../primitives/Button';
import { NavCard } from '../patterns/NavCard';
import { AppBar, ScreenHeader } from '../patterns/AppBar';
import { BottomNavigation } from '../patterns/BottomNavigation';
import { MetricCard } from '../patterns/MetricCard';
import { MiniBarChart } from '../patterns/MiniBarChart';
import { ProductDataRow } from '../patterns/ProductDataRow';
import { ActionList, KeyValueList, ListRow, Section } from '../patterns/Section';
import { StepIndicator } from '../patterns/StepIndicator';
import { StockMovementRow } from '../patterns/StockMovementRow';
import { SuggestionItem } from '../patterns/SuggestionItem';
import { SummaryCard } from '../patterns/SummaryCard';

const meta: Meta = { title: 'Patterns' };
export default meta;

export const SELLER_NAV = [
  { id: 'home', label: 'خانه', icon: 'home', href: '#home' },
  { id: 'products', label: 'کالاها', icon: 'products', href: '#products' },
  { id: 'customers', label: 'مشتریان', icon: 'customers', href: '#customers' },
  { id: 'reports', label: 'گزارش‌ها', icon: 'reports', href: '#reports' },
  { id: 'more', label: 'بیشتر', icon: 'more', href: '#more' },
] as const;

export const Bars: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-4">
      <AppBar title="ثبت کالا" back={() => undefined} />
      <ScreenHeader title="امروز در فروشگاه" subtitle="دکانی · نوشت‌افزار آفتاب" />
      <BottomNavigation items={SELLER_NAV} activeId="home" />
    </div>
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-4">
      <div className="flex gap-3">
        <MetricCard label="فروش امروز" value="۱٬۰۰۰٬۰۰۰" unit="تومان" delta="+۲۰۰٬۰۰۰ (۲۵٪)" />
        <MetricCard label="دریافت امروز" value="۸۰۰٬۰۰۰" unit="تومان" />
      </div>
      <Section title="کارهای روزانه">
        <ActionList>
          <Button block variant="secondary">ثبت فروش</Button>
          <Button block variant="secondary">افزودن کالا</Button>
        </ActionList>
      </Section>
      <Section title="نیازمند توجه">
        <ListRow>۳ کالا نزدیک اتمام</ListRow>
        <ListRow>۲ کالا با بهای نامعلوم</ListRow>
      </Section>
      <Section title="فروش این هفته" description="۲۹ شهریور تا ۳ مهر · هزار تومان">
        <MiniBarChart
          label="روند فروش هفته"
          data={[
            { label: 'شنبه', value: 100, display: '۱۰۰' },
            { label: 'یک‌شنبه', value: 150, display: '۱۵۰' },
            { label: 'دوشنبه', value: 180, display: '۱۸۰' },
            { label: 'سه‌شنبه', value: 120, display: '۱۲۰' },
            { label: 'چهارشنبه', value: 200, display: '۲۰۰' },
            { label: 'پنج‌شنبه', value: 250, display: '۲۵۰' },
          ]}
        />
      </Section>
    </div>
  ),
};

export const Rows: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-3">
      <ProductDataRow title="خودکار بیک آبی مدل A" subtitle="۱۷ عدد · SKU P-100" meta="۱۰٬۰۰۰ تومان" href="#" />
      <ProductDataRow title="پرینت سیاه‌وسفید A4" subtitle="خدمت · صفحه" meta="۳٬۰۰۰ تومان" badge={<Badge tone="info">خدمت</Badge>} onClick={() => undefined} />
      <ProductDataRow title="مدادرنگی آریا ۱۲رنگ" subtitle="۴ جعبه" meta="بهای نامعلوم" metaTone="warning" selected onClick={() => undefined} />
      <SuggestionItem kind="ExactProduct" title="خودکار بیک آبی مدل A" description="در فروشگاه · ۱۷ عدد" onSelect={() => undefined} />
      <SuggestionItem kind="CreateNew" title="ثبت «خودکار بیک قرمز» به‌عنوان کالای جدید" onSelect={() => undefined} />
      <StockMovementRow title="خرید" reference="رسید ۱۲" date="۱۴۰۵/۰۷/۰۵" quantity="+۶۰" direction="in" balance="مانده ۷۷" />
      <StockMovementRow title="فروش" reference="فاکتور ۱۰۲۴" date="۱۴۰۵/۰۷/۰۵" quantity="−۴۳" direction="out" balance="مانده ۳۴" />
    </div>
  ),
};

export const Summaries: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-4">
      <StepIndicator current={2} total={5} label="ثبت کالا" />
      <KeyValueList items={[{ label: 'واحد پایه', value: 'عدد' }, { label: 'موجودی', value: '۶۰ عدد' }, { label: 'قیمت فروش', value: '۱۰٬۰۰۰ تومان', emphasis: true }]} />
      <SummaryCard
        lines={[
          { label: 'جمع اقلام', value: '۴۱۰٬۰۰۰' },
          { label: 'تخفیف', value: '۰' },
          { label: 'دریافت‌شده', value: '۲۰۰٬۰۰۰', tone: 'success' },
          { label: 'مانده (نسیه)', value: '۲۱۰٬۰۰۰', tone: 'danger' },
          { label: 'مبلغ نهایی (تومان)', value: '۴۱۰٬۰۰۰', total: true },
        ]}
      />
    </div>
  ),
};

/** Figma «storeselect» rows: initial, title, meta, accent call to action, chevron. */
export const NavCards: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-3">
      <NavCard href="#store" title="نوشت‌افزار آفتاب" meta="مالک · فروشگاه پیش‌فرض" cta="ورود به پنل" />
      <NavCard onClick={() => undefined} title="فروشگاه مهر" meta="دعوت به همکاری" cta="مشاهده دعوت" />
      <NavCard href="#purchase" title="رسید ۱۲ · پخش مهر" meta="۲ قلم · ۱٬۸۰۰٬۰۰۰ تومان" cta="نهایی" />
    </div>
  ),
};

/** «Action / …» instances that navigate (home daily tasks, more menu). */
export const ButtonLinks: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-3">
      <ButtonLink href="#sale">ثبت فروش</ButtonLink>
      <ButtonLink href="#entry" variant="primary" iconStart="plus">
        افزودن کالا
      </ButtonLink>
    </div>
  ),
};
