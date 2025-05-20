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
      corner: {
        getList: (use_yn: string) => Promise<any>;
        getList2: (use_yn: string) => Promise<any>;
        add: (cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, corner_nm:string, use_yn:string)
          => Promise<void>;
      };
      product: {
        getList: () => Promise<any>;
        add: (cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, item_cd:string, item_nm:string, price:string, soldout_yn:string, use_yn:string)
          => Promise<void>;
        updateSoldout: (item_cd:string, soldout_yn: string) => Promise<void>;
      }
    };
  }
}
