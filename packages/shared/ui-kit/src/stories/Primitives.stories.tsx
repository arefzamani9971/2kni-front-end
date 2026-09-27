import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Chip, ChipGroup } from '../primitives/Chip';
import { IconButton } from '../primitives/IconButton';
import { PillAction } from '../primitives/PillAction';
import { Skeleton } from '../primitives/Skeleton';
import { Spinner } from '../primitives/Spinner';

const meta: Meta = { title: 'Primitives' };
export default meta;

export const Buttons: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Button block>ادامه</Button>
      <Button block disabled>ادامه</Button>
      <Button block variant="secondary">ادامه</Button>
      <Button block variant="secondary" disabled>ادامه</Button>
      <Button block loading>ثبت فروش</Button>
      <Button block variant="text" iconStart="plus">افزودن ردیف</Button>
      <Button block variant="danger">حذف کالا</Button>
      <Button block variant="danger-secondary">ابطال رسید</Button>
      <div className="flex gap-2">
        <Button size="sm">کوچک</Button>
        <Button>پیش‌فرض</Button>
        <Button size="lg">بزرگ</Button>
      </div>
      <div className="flex gap-2">
        <IconButton icon="search" label="جست‌وجو" />
        <IconButton icon="scan" label="اسکن" tone="brand" />
        <IconButton icon="trash" label="حذف" tone="danger" />
      </div>
    </div>
  ),
};

export const BadgesAndChips: StoryObj = {
  render: function Render() {
    const [sel, setSel] = useState('all');
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">۲ سفارش فعال</Badge>
          <Badge tone="warning" icon="alert-warning">۱ بدهی سررسیددار</Badge>
          <Badge tone="success" icon="check">پرداخت‌شده</Badge>
          <Badge tone="danger">برگشت خورده</Badge>
          <Badge tone="info">در انتظار بررسی</Badge>
          <Badge>بایگانی</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="warning" appearance="outline">در انتظار بررسی</Badge>
          <Badge tone="info" appearance="outline">مشخصات این فروشگاه</Badge>
          <Badge tone="danger" appearance="outline">مغایرت</Badge>
          <Badge size="sm" tone="success">موجود</Badge>
          <Badge size="sm" tone="warning">ناموجود</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <PillAction icon="plus">افزودن به سبد</PillAction>
          <PillAction disabled>ناموجود</PillAction>
        </div>
        <ChipGroup label="فیلتر">
          {[['all', 'همه'], ['debt', 'بدهکار'], ['settled', 'تسویه‌شده']].map(([v, l]) => (
            <Chip key={v} selected={sel === v} onClick={() => setSel(v!)}>{l}</Chip>
          ))}
        </ChipGroup>
      </div>
    );
  },
};

export const Loading: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Spinner />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  ),
};
