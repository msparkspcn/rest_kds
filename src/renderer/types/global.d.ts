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
        addOrderHd: (cmp_cd:string, sale_dt:string, sales_org_cd:string, stor_cd:string, pos_no:string,
              trade_no:string, trade_div:string, org_time:string, com_time:string, reg_date:Date,
              upd_date:Date, state:string, cornerCd:string)
          => Promise<void>;
        addOrderCorner: (cmp_cd:string, sale_dt:string, sales_org_cd:string, stor_cd:string, corner_cd:string,
             order_no_c:string, state:string)
          => Promise<void>;
        addOrderDt: (cmp_cd:string, sale_dt:string, sales_org_cd:string, stor_cd:string, corner_cd:string, pos_no:string, trade_no:string, seq:string, item_plu_cd:string, item_nm:string,
         item_div:string, sale_qty:number, order_no_c:string, set_menu_cd:string, trade_div:string, reg_date:Date, upd_date:date)
                     => Promise<void>;
      }
    };
  }
}

