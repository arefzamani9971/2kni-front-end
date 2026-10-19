export interface DetailsActionsProps {
  readonly review: boolean;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onBack?: () => void;
}
