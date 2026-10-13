import { render } from '@dukani/i18n/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createDataClient } from '@dukani/data';
import { MembershipsModuleProvider } from '../../module';
import type { MembershipsRepository } from '../../application/ports';
import { StoreJoinScreen } from './StoreJoinScreen';

const setup = (
  options: { member?: boolean; available?: boolean; signedIn?: boolean; marketingFails?: boolean } = {},
) => {
  const repository: MembershipsRepository = {
    resolve: vi.fn().mockResolvedValue({
      publicCode: 'ABCD2345',
      displayName: 'فروشگاه آزمایشی',
      address: null,
      available: options.available ?? true,
    }),
    status: vi.fn().mockResolvedValue({ storeId: 'store-1', isMember: options.member ?? false }),
    join: vi.fn().mockResolvedValue({ storeId: 'store-1', isMember: true }),
    grantMarketing: options.marketingFails
      ? vi.fn().mockRejectedValue({ kind: 'Network', code: 'NETWORK_ERROR' })
      : vi.fn().mockResolvedValue(undefined),
  };
  const login = vi.fn();
  render(
    <DataProvider client={createDataClient()}>
      <MembershipsModuleProvider value={{ memberships: repository }}>
        <StoreJoinScreen
          publicCode="ABCD2345"
          sessionReady
          signedIn={options.signedIn ?? true}
          onLogin={login}
          onBack={vi.fn()}
        />
      </MembershipsModuleProvider>
    </DataProvider>,
  );
  return { repository, login, user: userEvent.setup() };
};

it('does not join on scan; explicit membership does not grant marketing consent', async () => {
  const { repository, user } = setup();
  const button = await screen.findByRole('button', { name: 'عضویت بدون پیامک تبلیغاتی' });
  expect(repository.join).not.toHaveBeenCalled();
  await user.click(button);
  expect(await screen.findByText('شما عضو این فروشگاه هستید.')).toBeVisible();
  expect(repository.join).toHaveBeenCalledExactlyOnceWith('ABCD2345');
  expect(repository.grantMarketing).not.toHaveBeenCalled();
});

it('existing members do not need another join or consent mutation', async () => {
  const { repository } = setup({ member: true });
  expect(await screen.findByText('شما عضو این فروشگاه هستید.')).toBeVisible();
  expect(repository.join).not.toHaveBeenCalled();
  expect(repository.grantMarketing).not.toHaveBeenCalled();
});

it('gated entry offers no membership or OTP action', async () => {
  const { repository } = setup({ available: false, signedIn: false });
  expect(await screen.findByText('عضویت آنلاین این فروشگاه هنوز در دسترس نیست.')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'ورود و ادامه' })).not.toBeInTheDocument();
  expect(repository.status).not.toHaveBeenCalled();
});

it('guests enter authentication without joining first', async () => {
  const { repository, login, user } = setup({ signedIn: false });
  await user.click(await screen.findByRole('button', { name: 'ورود و ادامه' }));
  expect(login).toHaveBeenCalledOnce();
  expect(repository.join).not.toHaveBeenCalled();
});

it('marketing failure retains successful membership and only retries consent', async () => {
  const { repository, user } = setup({ marketingFails: true });
  await user.click(await screen.findByRole('button', { name: 'اجازه پیامک و عضویت' }));
  expect(await screen.findByText('شما عضو این فروشگاه هستید.')).toBeVisible();
  await user.click(await screen.findByRole('button', { name: 'تلاش دوباره برای ثبت اجازه' }));
  await waitFor(() => expect(repository.grantMarketing).toHaveBeenCalledTimes(2));
  expect(repository.join).toHaveBeenCalledTimes(1);
});
