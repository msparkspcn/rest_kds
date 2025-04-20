import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import './OrderContainer.scss';

interface OrderItem {
  productNm: string;
  saleQty: number;
}

interface OrderData {
  orderNo: string;
  instTime: string;
  orderDtList: OrderItem[];
}

interface OrderContainerProps {
  item: OrderData;
}

function OrderContainer({ item }: OrderContainerProps): JSX.Element {
  const [backColor, setBackColor] = useState('bg-green-600');
  const [diff, setDiff] = useState(0);

  console.log(`item:${JSON.stringify(item)}`);

  const displayInstTime = dayjs(item.instTime, 'YYYYMMDDHHmmss').format('HH:mm:ss');
  const timeDiff = dayjs(item.instTime, 'YYYY-MM-DDTHH:mm:ss', true).diff(dayjs(), 'minute');
  useEffect(() => {
    const interval = setInterval(() => {
      if (timeDiff > -5) {
        setBackColor('bg-green-600');
      }
      if (timeDiff <= -5 && timeDiff > -10) {
        setBackColor('bg-yellow-600');
      } else if (timeDiff <= -10) {
        setBackColor('bg-red-600');
      }
      setDiff(timeDiff);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className={`order-container ${backColor}`}>
      <OrderHeader orderNo={item.orderNo} instTime={displayInstTime} diff={diff} />
      <div className="order-items">
        {item.orderDtList.map((orderItem, index) => (
          <RenderItem key={index} item={orderItem} index={index} />
        ))}
      </div>
    </div>
  );
}

interface OrderHeaderProps {
  orderNo: string;
  instTime: string;
  diff: number;
}
/* hd 가져오고 orderNo, updTime, 경과시간 처리.(경과시간 무엇을 기준으로 하는지 확인 필요) */
function OrderHeader({ orderNo, instTime, diff }: OrderHeaderProps): JSX.Element {
  return (
    <div className="order-header">
      <div className="header-cell order-no">{orderNo}</div>
      <div className="header-cell inst-time">{instTime}</div>
      <div className="header-cell diff">{diff * -1}&apos;</div>
    </div>
  );
}

interface RenderItemProps {
  item: OrderItem;
  index: number;
}

function RenderItem({ item, index }: RenderItemProps): JSX.Element {
  return (
    <button type="button" className="order-item" onClick={() => {}}>
      <div className="order-row">
        <div className="order-cell index">{index + 1}</div>
        <div className="order-cell name">{item.productNm}</div>
        <div className="order-cell qty">{item.saleQty}</div>
      </div>
    </button>
  );
}

export default OrderContainer;
