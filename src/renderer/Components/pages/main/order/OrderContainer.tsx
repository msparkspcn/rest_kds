import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import './OrderContainer.scss';

interface OrderItem {
  // itemNm: string;
  productNm: string;
  saleQty: number;
  addedSeq:number;
}

interface OrderData {
  orderNo: string;
  instTime: string;
  orderDtList: OrderItem[];
}

interface OrderContainerProps {
  item: OrderData;
  onSelectOrder: (orderNo: string) => void;
}

function OrderContainer({ item, onSelectOrder }: OrderContainerProps): JSX.Element {
  const [backColor, setBackColor] = useState('bg-green-600');
  const [diff, setDiff] = useState(0);

  // console.log(`item:${JSON.stringify(item)}`);

  const displayInstTime = dayjs(item.instTime, 'YYYYMMDDHHmmss').format('HH:mm:ss');

  useEffect(() => {
    const interval = setInterval(() => {
      const timeDiff = dayjs(item.instTime, 'YYYY-MM-DDTHH:mm:ss', true).diff(dayjs(), 'minute');
      // console.log("timeDiff:"+timeDiff)
      if (timeDiff > -5) {
        setBackColor('bg-green');
      } else if (timeDiff <= -5 && timeDiff > -10) {
        setBackColor('bg-yellow');
      } else if (timeDiff <= -10) {
        // console.log("here")
        // setBackColor('bg-red');
        setBackColor('bg-white');
      }
      setDiff(timeDiff);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className={`order-container ${backColor}`} onClick={() => onSelectOrder(item.orderNo)}>
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
    <div className="order-row">
      <div className="order-cell index">{index + 1}</div>
      <div className="order-cell name">
        {item.addedSeq !== 0 ? '↳' : ''}
        {item.productNm}
      </div>
      <div className="order-cell qty">{item.saleQty}</div>
    </div>
  );
}

export default OrderContainer;
