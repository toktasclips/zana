interface Window {
  OneSignalDeferred: Array<(oneSignal: {
    init: (config: Record<string, unknown>) => void;
    User: {
      PushSubscription: {
        optIn: () => Promise<void>;
      };
    };
  }) => void>;
}
