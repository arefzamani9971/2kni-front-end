'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Local generation keeps membership links out of third-party image services. */
export function useQrImage(value: string | undefined) {
  const [result, setResult] = useState<{ value: string; src: string }>();
  const [failedValue, setFailedValue] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!value) return;
    let active = true;
    void QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 4, width: 800 }).then(
      (src) => {
        if (active) setResult({ value, src });
      },
      () => {
        if (active) setFailedValue(value);
      },
    );
    return () => {
      active = false;
    };
  }, [value, attempt]);
  return {
    src: result && result.value === value ? result.src : undefined,
    failed: !!value && failedValue === value,
    retry: () => {
      setFailedValue(undefined);
      setAttempt((current) => current + 1);
    },
  };
}
