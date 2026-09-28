import { Spinner } from '@dukani/ui-kit';

export function BootSpinner() {
  return (
    <div className="flex h-dvh items-center justify-center bg-canvas text-fg-brand">
      <Spinner size={32} />
    </div>
  );
}
