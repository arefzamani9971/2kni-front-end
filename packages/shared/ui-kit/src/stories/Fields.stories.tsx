import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BarcodeField } from '../fields/BarcodeField';
import { CardNumberField } from '../fields/CardNumberField';
import { Checkbox } from '../fields/Checkbox';
import { DecimalField } from '../fields/DecimalField';
import { FileUploadField, type PickedFile } from '../fields/FileUploadField';
import { IntegerField } from '../fields/IntegerField';
import { IranMobileField } from '../fields/IranMobileField';
import { LandlineField } from '../fields/LandlineField';
import { MoneyField } from '../fields/MoneyField';
import { NationalIdField } from '../fields/NationalIdField';
import { OtpField } from '../fields/OtpField';
import { PercentField } from '../fields/PercentField';
import { PostalCodeField } from '../fields/PostalCodeField';
import { QuantityField } from '../fields/QuantityField';
import { RadioGroup } from '../fields/RadioGroup';
import { SegmentedControl } from '../fields/SegmentedControl';
import { ShebaField } from '../fields/ShebaField';
import { Switch } from '../fields/Switch';
import { Tabs } from '../fields/Tabs';
import { PickerField } from '../fields/PickerField';
import { QuantityStepper } from '../fields/QuantityStepper';
import { SearchField } from '../fields/SearchField';
import { SelectField } from '../fields/SelectField';
import { TextArea } from '../fields/TextArea';
import { TextField } from '../fields/TextField';

const meta: Meta = { title: 'Fields' };
export default meta;

const Box = ({ children }: { children: React.ReactNode }) => <div className="flex max-w-sm flex-col gap-4">{children}</div>;

/** Figma Numeric Field (403:2): Kind × State. */
export const NumericFieldFamily: StoryObj = {
  render: () => (
    <Box>
      <IranMobileField defaultValue="" />
      <IranMobileField defaultValue="09123456789" />
      <IranMobileField defaultValue="0812" status="error" message="شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود." />
      <IranMobileField defaultValue="09123456789" disabled />
      <OtpField defaultValue="012345" />
      <OtpField defaultValue="123" status="error" message="کد ورود باید دقیقاً ۶ رقم باشد." />
      <IntegerField label="تعداد" defaultValue="12" />
      <IntegerField label="تعداد" defaultValue="" status="error" message="فقط عدد صحیح وارد کنید." />
    </Box>
  ),
};

/** Character filters: type a forbidden character to see the rejection message. */
export const InputFilters: StoryObj = {
  render: () => (
    <Box>
      <TextField label="فقط عدد" filter="digits" asciiDigits dir="ltr" hint="حروف پذیرفته نمی‌شوند" />
      <TextField label="فقط حروف" filter="letters" />
      <TextField label="فقط حروف فارسی (نام)" filter="persian-letters" placeholder="مریم احمدی" />
      <TextField label="متن فارسی (بدون حروف انگلیسی)" filter="persian" />
      <TextField label="فقط انگلیسی" filter="latin" dir="ltr" />
      <TextField label="حروف و رقم" filter="alphanumeric" />
      <TextField label="ایمیل" filter="email" type="email" dir="ltr" />
      <TextField label="الگوی دلخواه (حروف بزرگ و رقم)" filter={{ pattern: /^[A-Z0-9]*$/, message: 'فقط حروف بزرگ انگلیسی و رقم.' }} dir="ltr" />
    </Box>
  ),
};

/** Status styling and per-part class overrides. */
export const StatusesAndCustomClasses: StoryObj = {
  render: () => (
    <Box>
      <TextField label="عنوان کالا" defaultValue="خودکار بیک آبی" status="error" message="این عنوان قبلاً ثبت شده است." />
      <TextField label="قیمت فروش" defaultValue="۹۵٬۰۰۰" status="warning" message="قیمت فروش کمتر از بها است." />
      <TextField label="کد پستی" defaultValue="۱۴۳۴۸۶۳۱۱۱" status="success" message="کد پستی معتبر است." />
      <TextField label="یادداشت" hint="حداکثر ۲۰۰ نویسه" optional />
      <TextField label="نام فروشگاه" required defaultValue="نوشت‌افزار آفتاب" readOnly />
      <TextField
        label="کلاس سفارشی برای هشدار"
        defaultValue="۱۲"
        status="warning"
        message="موجودی کمتر از آستانه است."
        statusClassNames={{ warning: { box: 'border-2 border-accent bg-warning-subtle', message: 'font-medium' } }}
        classNames={{ label: 'text-fg-brand', input: 'text-heading-s' }}
      />
      <TextField label="با پیشوند و پسوند" prefix="@" suffix="کیلوگرم" clearable defaultValue="مقدار" />
    </Box>
  ),
};

export const IdentityAndBank: StoryObj = {
  render: function Render() {
    const [sheba, setSheba] = useState('');
    const [card, setCard] = useState('');
    return (
      <Box>
        <NationalIdField />
        <PostalCodeField />
        <LandlineField />
        <CardNumberField value={card} onChange={setCard} hint={card ? `مقدار: ${card}` : undefined} />
        <ShebaField value={sheba} onChange={setSheba} hint={sheba ? `مقدار: ${sheba}` : undefined} />
      </Box>
    );
  },
};

export const MoneyAndQuantity: StoryObj = {
  render: function Render() {
    const [price, setPrice] = useState('');
    return (
      <Box>
        <MoneyField label="قیمت فروش" value={price} onChange={setPrice} hint={price ? `مقدار canonical: ${price}` : 'بدون تبدیل ریال و تومان'} />
        <QuantityField label="مقدار (کیلوگرم)" maxDecimals={3} unit="کیلوگرم" />
        <QuantityField label="تعداد (عدد)" unit="عدد" hint="کالای شمارشی اعشار نمی‌پذیرد" />
        <PercentField label="درصد افزایش" />
        <DecimalField label="اختلاف (منفی مجاز)" allowNegative maxDecimals={2} />
      </Box>
    );
  },
};

export const TextAndSearch: StoryObj = {
  render: () => (
    <Box>
      <SearchField label="جست‌وجوی نام یا بارکد" hideLabel />
      <BarcodeField onScan={() => alert('scan')} />
      <TextArea label="توضیحات" showCount maxLength={200} optional />
    </Box>
  ),
};

export const Selection: StoryObj = {
  render: function Render() {
    const [type, setType] = useState('');
    const [method, setMethod] = useState<'cash' | 'pos' | 'transfer'>('cash');
    const [kind, setKind] = useState<'Goods' | 'Service'>('Goods');
    const [tab, setTab] = useState<'a' | 'b'>('a');
    const [agree, setAgree] = useState(false);
    const [sms, setSms] = useState(true);
    return (
      <Box>
        <SelectField
          label="نوع فروشگاه"
          value={type}
          onChange={setType}
          options={[
            { value: 'stationery', label: 'نوشت‌افزار' },
            { value: 'cosmetics', label: 'آرایشی و بهداشتی' },
            { value: 'clothing', label: 'پوشاک' },
            { value: 'market', label: 'سوپرمارکت' },
          ]}
          createAction={{ label: 'سایر (ثبت نیاز)', onSelect: () => undefined }}
        />
        <SegmentedControl label="نوع قلم" value={kind} onChange={setKind} options={[{ value: 'Goods', label: 'کالا' }, { value: 'Service', label: 'خدمت' }]} />
        <RadioGroup
          label="روش دریافت"
          value={method}
          onChange={setMethod}
          options={[
            { value: 'cash', label: 'نقدی', description: 'بقیه پول محاسبه می‌شود' },
            { value: 'pos', label: 'کارت‌خوان' },
            { value: 'transfer', label: 'کارت‌به‌کارت' },
          ]}
        />
        <Checkbox label="ارسال پیامک فاکتور" checked={agree} onChange={setAgree} description="مشتری لینک فاکتور را دریافت می‌کند" />
        <Switch label="ارسال پیامک به‌صورت پیش‌فرض" checked={sms} onChange={setSms} />
        <Tabs value={tab} onChange={setTab} tabs={[{ value: 'a', label: 'بدهکاران فعلی', content: 'فهرست بدهکاران' }, { value: 'b', label: 'نسیه‌بگیران دوره', content: 'سابقه نسیه' }]} />
      </Box>
    );
  },
};

/** Figma Quantity Stepper (498:98): Compact (cart line) and Regular (product page). */
export const Stepper: StoryObj = {
  render: function Render() {
    const [a, setA] = useState(2);
    const [b, setB] = useState(20);
    return (
      <Box>
        <QuantityStepper label="تعداد در سبد" value={a} onChange={setA} min={1} max={9} />
        <QuantityStepper label="تعداد" size="regular" value={b} onChange={setB} />
        <QuantityStepper label="تعداد" value={1} onChange={() => undefined} disabled />
      </Box>
    );
  },
};

export const FileUpload: StoryObj = {
  render: function Render() {
    const [images, setImages] = useState<PickedFile[]>([]);
    const [docs, setDocs] = useState<PickedFile[]>([]);
    return (
      <Box>
        <FileUploadField label="تصاویر کالا" images accept="image/jpeg,image/png,image/webp" maxFiles={8} value={images} onChange={setImages} optional hint="حداکثر ۸ تصویر، هر کدام ۱۰ مگابایت" />
        <FileUploadField label="ضمیمه فاکتور خرید" accept="application/pdf,image/*" maxFiles={3} value={docs} onChange={setDocs} optional />
      </Box>
    );
  },
};

/** Field-looking trigger for full-screen pickers (ST02 store type, product type, supplier). */
export const Picker: StoryObj = {
  render: () => (
    <div className="flex max-w-[390px] flex-col gap-4">
      <PickerField label="نوع فروشگاه" required placeholder="انتخاب نوع" onOpen={() => undefined} />
      <PickerField label="نوع فروشگاه" required display="لوازم‌التحریر · تغییر نوع" onOpen={() => undefined} />
      <PickerField label="نوع فروشگاه" required status="error" message="نوع فروشگاه را انتخاب کنید." onOpen={() => undefined} />
    </div>
  ),
};
