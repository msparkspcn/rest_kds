import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import './OrderContainer.scss';
import { log } from '@Components/utils/logUtil';

interface OrderItem {
  // itemNm: string;
  seq: number;
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
  saleDt: string;
  orderDtList: OrderItem[];
}

interface OrderContainerProps {
  item: OrderData;
  onSelectOrder: (order: OrderData) => void;
  selectedOrderNo: string | null;
  selectedTradeNo: string | null;
}

function OrderContainer({ item, onSelectOrder, selectedOrderNo, selectedTradeNo }: OrderContainerProps): JSX.Element {
  const [backColor, setBackColor] = useState('bg-green-600');
  const [diff, setDiff] = useState(0);

  // console.log(`11item:${JSON.stringify(item)}`);
  const filteredTime = item.ordTime ?? "222222"

  const displayInstTime = `${filteredTime.slice(0, 2)}:${filteredTime.slice(2, 4)}:${filteredTime.slice(4, 6)}`;

  useEffect(() => {
    const checkTimeDiff = () => {
      const orderDateTime = dayjs(`${item.saleDt}${item.ordTime}`, 'YYYYMMDDHHmmss');
      const timeDiff = dayjs(orderDateTime, 'YYYY-MM-DDTHH:mm:ss', true).diff(dayjs(), 'minute');
      if (timeDiff > -5) {
        setBackColor('bg-green');
      } else if (timeDiff <= -5 && timeDiff > -10) {
        setBackColor('bg-yellow');
      } else if (timeDiff <= -10) {
        setBackColor('bg-red');
      }
      setDiff(timeDiff);
    }
    checkTimeDiff();

    const interval = setInterval(checkTimeDiff, 60000);

    return () => clearInterval(interval);
  },[]);

  return (
    <div
      className={`order-container ${backColor} ${
        selectedTradeNo === item.tradeNo && selectedOrderNo === item.orderNoC
          ? 'selected-border'
          : ''
      }`}
      onClick={() => onSelectOrder(item)}
    >
      <OrderHeader orderNoC={item.orderNoC} instTime={displayInstTime} diff={diff} status={item.status}/>
      <div className="order-items">
        {item.orderDtList.map((orderItem, index) => (
          <RenderItem
            key={orderItem.seq}
            item={orderItem}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface OrderHeaderProps {
  orderNoC: string;
  instTime: string;
  diff: number;
  status: string;
}
/* hd 가져오고 orderNo, updTime, 경과시간 처리.(경과시간 무엇을 기준으로 하는지 확인 필요) */
function OrderHeader({ orderNoC, instTime, diff, status }: OrderHeaderProps): JSX.Element {
  // log("status:"+status+", orderNoC:"+orderNoC)
  return (
    <div className="order-header">
      <div className="header-cell order-no">{orderNoC}</div>
      <div className="header-cell inst-time">{instTime}</div>
      <div className={`header-cell ${status === "8" ? 'refund' : 'diff'}`}>
        {status === "8" ? "반품" : `${diff * -1}'`}
      </div>
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
        {item.itemNm}
      </div>
      <div className="order-cell qty">{item.saleQty}</div>
    </div>
  );
}

export default OrderContainer;
