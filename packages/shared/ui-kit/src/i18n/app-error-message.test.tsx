import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@dukani/i18n';
import { appError, type AppError } from '@dukani/domain';
import { useAppErrorMessage } from './use-app-error-message';
function ErrorMessage({ error }: { error: AppError }) {
  const message = useAppErrorMessage();
  return <p>{message(error)}</p>;
}
describe('normalized error presentation', () => {
  it('retranslates a retained transport error when locale changes', () => {
    const error = appError('Server', 'HTTP_503', 'diagnostic', { messageSource: 'fallback' });
    const { rerender } = render(
      <I18nProvider locale="fa" messages={{}}>
        <ErrorMessage error={error} />
      </I18nProvider>,
    );
    expect(screen.getByText('خطای سرور؛ کمی بعد دوباره تلاش کنید.')).toBeInTheDocument();
    rerender(
      <I18nProvider locale="en" messages={{}}>
        <ErrorMessage error={error} />
      </I18nProvider>,
    );
    expect(screen.getByText('Server error. Try again shortly.')).toBeInTheDocument();
  });
  it('preserves backend details instead of replacing business guidance', () => {
    const error = appError('BusinessRule', 'CUSTOM_RULE', 'Server-provided guidance', {
      messageSource: 'server',
    });
    render(
      <I18nProvider locale="en" messages={{}}>
        <ErrorMessage error={error} />
      </I18nProvider>,
    );
    expect(screen.getByText('Server-provided guidance')).toBeInTheDocument();
  });
  it('distinguishes a failed connection from an uncertain sent command', () => {
    const error = appError('Unknown', 'NETWORK', 'diagnostic', { messageSource: 'fallback' });
    const { rerender } = render(
      <I18nProvider locale="en" messages={{}}>
        <ErrorMessage error={error} />
      </I18nProvider>,
    );
    expect(screen.getByText('The result is uncertain. We are checking it.')).toBeInTheDocument();
    rerender(
      <I18nProvider locale="en" messages={{}}>
        <ErrorMessage error={{ ...error, kind: 'Server' }} />
      </I18nProvider>,
    );
    expect(screen.getByText('Could not connect to the server. Try again.')).toBeInTheDocument();
  });
});
