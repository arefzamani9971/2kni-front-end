export type StoreJoinScreenProps = {
  readonly publicCode: string;
  readonly signedIn: boolean;
  readonly sessionReady: boolean;
  readonly onLogin: () => void;
  readonly onBack: () => void;
};
