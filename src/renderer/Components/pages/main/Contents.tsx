import { useState } from 'react';
import OrderContainer from './order/OrderContainer';
import './Contents.scss';

interface ContentsProps {
  orderList: string | any[];
  className?: string;
  onSelectOrderHd: (order: OrderData) => void;
  selectedOrderNo: string | null;
}
interface OrderItem {
  itemNm: string;
  saleQty: number;
}

interface OrderData {
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  cornerCd: string;
  posNo: string;
  tradeNo: string;
  orderNoC: string;
  ordTime: string;
  saleDt: string;
  orderDtList: OrderItem[];
  status: string;
}

function Contents({ orderList, onSelectOrderHd, selectedOrderNo }: ContentsProps): JSX.Element {
  const orderArray = Array.isArray(orderList) ? orderList : [];

  return (
    <div className="page-container">
      <div className="order-grid">
        {orderArray?.map((orderItem: any) => (
          <OrderContainer
            key={`${orderItem.orderNoC}_${orderItem.tradeNo}`}
            item={orderItem}
            onSelectOrder={onSelectOrderHd}
            selectedOrderNo={selectedOrderNo}
          />
        ))}
      </div>
    </div>
  );
}

export default Contents;
