'use client';
import { Button } from '@dukani/ui-kit';

export function BackButton({ onClick, label = 'بازگشت' }: { onClick: () => void; label?: string }) {
  return (
    <Button type="button" variant="secondary" block onClick={onClick}>
      {label}
    </Button>
  );
}
