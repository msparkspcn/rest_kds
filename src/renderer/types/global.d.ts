export {};

declare global {
  interface Window {
    ipc: {
      send: (channel: string, args: unknown) => void;
      receive: (channel: string, callBack: (...args: unknown[]) => void) => void;
      set: (key: string, val: unknown) => void;
      get: (key: string) => unknown;
      quitApp: () => void;
      cmp: {
        getList: () => Promise<any>;
        add: (cmp_cd: string, cmp_nm: string) => Promise<void>;
        update: (cmp_nm: string, cmp_cd: string) => Promise<void>;
        delete: (cmp_cd: string) => Promise<void>;
      };
    };
  }
}
