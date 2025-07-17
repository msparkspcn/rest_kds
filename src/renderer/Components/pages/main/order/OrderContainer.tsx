import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import './OrderContainer.scss';

interface OrderItem {
  // itemNm: string;
  seq: number; //seq 로 변경 예정(saleSeq만으로는 key로 사용할 수 없음)
  itemNm: string;
  saleQty: number;
  itemDiv:string;
  setMenuCd:string;
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
  orderDtList: OrderItem[];
}

interface OrderContainerProps {
  item: OrderData;
  onSelectOrder: (order: OrderData) => void;
}

function OrderContainer({ item, onSelectOrder }: OrderContainerProps): JSX.Element {
  const [backColor, setBackColor] = useState('bg-green-600');
  const [diff, setDiff] = useState(0);

  // console.log(`item:${JSON.stringify(item)}`);

  const displayInstTime = `${item.ordTime.slice(0, 2)}:${item.ordTime.slice(2, 4)}:${item.ordTime.slice(4, 6)}`;

  useEffect(() => {
    const checkTimeDiff = () => {
      const orderDateTime = dayjs(`${item.saleDt}${item.ordTime}`, 'YYYYMMDDHHmmss');
      const timeDiff = dayjs(orderDateTime, 'YYYY-MM-DDTHH:mm:ss', true).diff(dayjs(), 'minute');
      if (timeDiff > -5) {
        setBackColor('bg-green');
      } else if (timeDiff <= -5 && timeDiff > -10) {
        setBackColor('bg-yellow');
      } else if (timeDiff <= -10 && timeDiff > -20) {
        setBackColor('bg-red');
        // setBackColor('bg-white');
        // setBackColor('#fca5a5');
      }
      else if(timeDiff <= -28800) {
        setBackColor('bg-yellow');
      }
      else if(timeDiff <= -23300) {
        setBackColor('bg-green');
      }
      else if(timeDiff <= -21000) {
        setBackColor('bg-red');
      }
      setDiff(timeDiff);
    }
    checkTimeDiff();

    const interval = setInterval(checkTimeDiff, 60000);

    return () => clearInterval(interval);
  },[]);

  return (
    <div className={`order-container ${backColor}`} onClick={() => onSelectOrder(item)}>
      <OrderHeader orderNoC={item.orderNoC} instTime={displayInstTime} diff={diff} />
      <div className="order-items">
        {item.orderDtList.map((orderItem, index) => (
          <RenderItem key={orderItem.seq} item={orderItem} index={index} /> //임시
        ))}
      </div>
    </div>
  );
}

interface OrderHeaderProps {
  orderNoC: string;
  instTime: string;
  diff: number;
}
/* hd 가져오고 orderNo, updTime, 경과시간 처리.(경과시간 무엇을 기준으로 하는지 확인 필요) */
function OrderHeader({ orderNoC, instTime, diff }: OrderHeaderProps): JSX.Element {
  return (
    <div className="order-header">
      <div className="header-cell order-no">{orderNoC}</div>
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
        {item.itemDiv !== "0" ? '↳' : ''}
        {item.itemPluCd}
      </div>
      <div className="order-cell qty">{item.saleQty}</div>
    </div>
  );
}

export default OrderContainer;
