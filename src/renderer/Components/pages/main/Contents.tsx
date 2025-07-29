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
}

function Contents({ orderList, onSelectOrderHd, selectedOrderNo }: ContentsProps): JSX.Element {
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const orderArray = Array.isArray(orderList) ? orderList : [];
  const paginatedOrders = orderArray.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <div className="page-container">
      <div className="order-grid">
        {paginatedOrders?.map((orderItem: any) => (
          <OrderContainer
            key={orderItem.orderNoC}
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
