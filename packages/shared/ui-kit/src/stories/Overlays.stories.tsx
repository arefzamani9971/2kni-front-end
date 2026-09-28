import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BottomSheet } from '../overlays/BottomSheet';
import { ConfirmDialog } from '../overlays/ConfirmDialog';
import { QuickActionSheet } from '../overlays/QuickActionSheet';
import { Button } from '../primitives/Button';
import { useToast } from '../feedback/Toast';

const meta: Meta = { title: 'Overlays' };
export default meta;

export const Sheets: StoryObj = {
  render: function Render() {
    const [sheet, setSheet] = useState(false);
    const [quick, setQuick] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const toast = useToast();
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <Button onClick={() => setSheet(true)}>باز کردن شیت</Button>
        <Button variant="secondary" onClick={() => setQuick(true)}>اقدام سریع</Button>
        <Button variant="danger-secondary" onClick={() => setConfirm(true)}>ابطال رسید</Button>
        <Button variant="text" onClick={() => toast('کالا ثبت شد', 'success')}>نمایش پیام کوتاه</Button>
        <BottomSheet open={sheet} onOpenChange={setSheet} title="تخفیف فروش" footer={<Button block onClick={() => setSheet(false)}>اعمال تخفیف</Button>}>
          <p className="text-body-m">محتوای شیت (روی موبایل از پایین باز می‌شود).</p>
        </BottomSheet>
        <QuickActionSheet
          open={quick}
          onOpenChange={setQuick}
          title="کارهای روزانه"
          actions={[
            { id: 'sale', label: 'ثبت فروش', icon: 'cart', onSelect: () => undefined },
            { id: 'product', label: 'افزودن کالا', icon: 'products', onSelect: () => undefined },
            { id: 'purchase', label: 'ثبت خرید', icon: 'purchase', description: 'رسید چندقلمی', onSelect: () => undefined },
          ]}
        />
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="رسید خرید ابطال شود؟"
          description="موجودی ۱۰ خودکار کم می‌شود. این کار با سابقه ثبت می‌شود."
          confirmLabel="ابطال رسید"
          destructive
          onConfirm={() => setConfirm(false)}
        />
      </div>
    );
  },
};
