import { useState } from 'react';
import OrderContainer from './order/OrderContainer';
import './Contents.scss';
interface ContentsProps {
  orderList: string | any[];
  onRefresh: () => void;
  className?: string;
  onSelectOrderHd: (orderNo: string) => void;
}
interface OrderItem {
  productNm: string;
  saleQty: number;
}

interface OrderData {
  orderNo: string;
  instTime: string;
  orderDtList: OrderItem[];
}

function Contents({ orderList, onRefresh, onSelectOrderHd }: ContentsProps): JSX.Element {
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const orderArray = Array.isArray(orderList) ? orderList : [];
  const totalPages = Math.ceil(orderArray.length / ITEMS_PER_PAGE);
  const paginatedOrders = orderArray.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <div className="page-container">
      <div className="order-grid">
        {paginatedOrders?.map((orderItem: any, index: number) => (
          <OrderContainer
            key={orderItem.orderNo || index}
            item={orderItem}
            onSelectOrder={onSelectOrderHd}
          />
        ))}
      </div>
    </div>
  );
}

export default Contents;
