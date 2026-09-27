import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../feedback/Alert';
import { OfflineBanner, PageState, ResultScreen } from '../feedback/PageState';
import { Button } from '../primitives/Button';

const meta: Meta = { title: 'Feedback' };
export default meta;

export const Alerts: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Alert tone="danger" title="سررسید بدهی گذشته است" description="برای یادآوری تسویه پیامک بفرستید" />
      <Alert tone="warning" title="۲ کالا با بهای نامعلوم" description="سود فقط برای اقلام دارای بها محاسبه می‌شود." action={<Button size="sm" variant="secondary">تکمیل بها</Button>} />
      <Alert tone="info" title="تا تأیید فروشنده، مانده بدهی تغییر نمی‌کند." />
      <Alert tone="success" title="تسویه ثبت شد" />
    </div>
  ),
};

export const PageStates: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <OfflineBanner online={false} />
      <PageState kind="loading" />
      <PageState kind="empty" title="هنوز کالایی ندارید" description="اولین کالا را با اسکن بارکد یا جست‌وجو ثبت کنید." action={<Button block>افزودن کالا</Button>} />
      <PageState kind="error" action={<Button block variant="secondary">تلاش دوباره</Button>} />
      <PageState kind="offline" />
      <PageState kind="permission" />
      <PageState kind="not-released" />
      <PageState kind="unknown-result" />
    </div>
  ),
};

export const Result: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <ResultScreen title="کالا ثبت شد" description="خودکار بیک آبی مدل A · ۶۰ عدد">
        <div className="flex flex-col gap-2">
          <Button block>ثبت کالای بعدی</Button>
          <Button block variant="secondary">مشاهده کالا</Button>
        </div>
      </ResultScreen>
    </div>
  ),
};
