export {};

declare global {
  interface Window {
    ipc: {
      send: (channel: string, args: unknown) => void;
      receive: (channel: string, callBack: (...args: unknown[]) => void) => void;
      set: (key: string, val: unknown) => void;
      get: (key: string) => unknown;
      quitApp: () => void;
      getAppVersion(): Promise<string>;
      checkForUpdates(): Promise<{ updateAvailable: boolean }>;
      downloadUpdate(): Promise<{ success: boolean; error?: string }>;
      quitAndInstall(): Promise<void>;
      cmp: {
        getList: () => Promise<any>;
        add: (cmp_cd: string, cmp_nm: string) => Promise<void>;
        update: (cmp_nm: string, cmp_cd: string) => Promise<void>;
        delete: (cmp_cd: string) => Promise<void>;
      };
      corner: {
        getList: (use_yn: string) => Promise<any>;
        getList2: (cmp_cd:string, sales_org_cd:string, stor_cd:string, use_yn: string) => Promise<any>;
        add: (cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, corner_nm:string, use_yn:string)
          => Promise<void>;
      };
      product: {
        getList: (cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string) => Promise<any>;
        // getList: () => Promise<any>;
        add: (cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, item_cd:string,
              item_nm:string, price:string, soldout_yn:string, use_yn:string, sort_order: string)
          => Promise<void>;
        updateSoldout: (item_cd:string, soldout_yn: string) => Promise<void>;
      };
      order: {
        getList: () => Promise<any>;
        addOrderHd: (sale_dt:string, cmp_cd:string, sales_org_cd:string, stor_cd:string, cornerCd:string, pos_no:string,
              trade_no:string, org_time:string, com_time:string, status:string, order_no_c:string, upd_user_id:string, upd_date:Date)
          => Promise<void>;
        addOrderDt: (sale_dt:string, cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, pos_no:string,
                     trade_no:string, seq:string, item_plu_cd:string, item_nm:string,
         item_div:string, set_menu_cd:string, sale_qty:number)
                     => Promise<void>;
      }
    };
  }
}

