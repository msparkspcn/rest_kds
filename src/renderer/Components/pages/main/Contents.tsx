import { useState } from 'react';
import OrderContainer from './order/OrderContainer';

interface ContentsProps {
  orderList: string | any[];
  onRefresh: () => void;
  className?: string;
}

function Contents({ orderList, onRefresh, className }: ContentsProps): JSX.Element {
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const orderArray = Array.isArray(orderList) ? orderList : [];
  const totalPages = Math.ceil(orderArray.length / ITEMS_PER_PAGE);
  const paginatedOrders = orderArray.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <div className={'flex flex-col flex-1'}>
      <div className="flex-1 grid grid-cols-3 grid-rows-[repeat(3,minmax(0,1fr))] gap-4 w-full h-full p-4">
        {paginatedOrders?.map((orderItem: any, index: number) => (
          <OrderContainer key={orderItem.orderNo || index} item={orderItem} />
        ))}
      </div>
    </div>
  );
}

Contents.defaultProps = {
  className: 'flex flex-col flex-1',
};

export default Contents;
