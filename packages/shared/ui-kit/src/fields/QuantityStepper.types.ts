export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** `compact` = cart line (42px, radius 10); `regular` = product page (46px, radius 12, Numeric/M value). */
  size?: 'compact' | 'regular';
  /** Accessible name of the whole control, e.g. «تعداد خودکار بیک». */
  label: string;
  disabled?: boolean;
  className?: string;
};
