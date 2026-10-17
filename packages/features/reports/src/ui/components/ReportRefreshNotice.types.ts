export type ReportRefreshNoticeProps = {
  readonly failed: boolean;
  readonly refreshing: boolean;
  readonly onRetry: () => void;
};
