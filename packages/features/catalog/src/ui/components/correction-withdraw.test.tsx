import { render } from '@dukani/i18n/testing';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { appError } from '@dukani/domain';
import { CorrectionWithdraw } from './CorrectionWithdraw';

const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('../hooks/use-correction-actions', () => ({
  useCorrectionActions: () => ({ run: mocks.run, pending: false, error: null }),
}));

const withdraw = () => within(screen.getByRole('dialog')).getByRole('button', { name: 'پس گرفتن درخواست' });

beforeEach(() => {
  mocks.run.mockReset();
});

describe('withdraw confirmation (F11 §7, PAT-MODAL-01)', () => {
  it('a failed withdraw keeps the confirmation open with the error, and a retry runs once', async () => {
    mocks.run.mockRejectedValueOnce(appError('Conflict', 'INVALID_STATE_TRANSITION', 'Closed')).mockResolvedValue({});
    render(<CorrectionWithdraw correctionId="c1" />);
    fireEvent.click(screen.getByRole('button', { name: 'پس گرفتن درخواست' }));
    await act(async () => fireEvent.click(withdraw()));
    expect(within(screen.getByRole('dialog')).getByText('انجام نشد')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(withdraw());
      fireEvent.click(withdraw());
    });
    expect(mocks.run).toHaveBeenCalledTimes(2);
    expect(mocks.run).toHaveBeenLastCalledWith({ kind: 'withdraw' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
