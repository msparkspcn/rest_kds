declare global {
  interface Window {
    ipc: {
      salesorg: any;
      saleOpen: any;
      order: any;
      log: any;
      cmp: any;
      corner: any;
      product: any;
      /* ELECTRON IPC TYPES */
      send(channel: string, args: unknown);
      receive(channel: string, callBack: (...args: unknown[]) => void);
      /* ELECTRON IPC TYPES */
      set: (key: string, val: unknown) => void;
      get: (key: string) => unknown;
      quitApp: () => void;
      isElectron?: boolean;
      getAppVersion(): Promise<string>;
      checkForUpdates(): Promise<{ updateAvailable: boolean }>;
      downloadUpdate(): Promise<{ success: boolean; error?: string }>;
      quitAndInstall(): Promise<void>;
    };
  }
}

export {};
