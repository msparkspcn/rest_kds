import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

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
    <div className={`w-full h-full ${backColor}`}>
      <OrderHeader orderNo={item.orderNo} instTime={displayInstTime} diff={diff} />
      <div className="overflow-y-auto max-h-[170px]">
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
    <div className="flex w-full h-10">
      <div className="flex-3 border border-gray-400 bg-gray-500 p-1 text-white text-2xl flex justify-start items-end">
        {orderNo}
      </div>
      <div className="flex-4 border border-gray-400 bg-gray-500 p-1 text-white text-xl flex justify-center items-end">
        {instTime}
      </div>
      <div className="flex-3 border border-gray-400 bg-gray-500 p-1 text-white text-xl flex justify-center items-end">
        {diff * -1}&apos;
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
    <button type="button" className="w-full h-9 text-black" onClick={() => {}}>
      <div className="flex w-full">
        <div className="flex-1 border border-gray-400 bg-white p-1">{index + 1}</div>
        <div className="flex-8 border border-gray-400 bg-white p-1 flex justify-start items-end">
          {item.productNm}
        </div>
        <div className="flex-1 border border-gray-400 bg-white p-1">{item.saleQty}</div>
      </div>
    </button>
  );
}

export default OrderContainer;
