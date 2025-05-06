import React from "react";
import {STRINGS} from "../../../../constants/strings";
import './OrderActionBar.scss';

interface OrderActionBarProps {
    orderCnt: number;
    selectedOrderNo: string | null;
}

const OrderActionBar: React.FC<OrderActionBarProps> =
  ({ orderCnt,
     selectedOrderNo,
    onOpenCallOrder,
     onCallOrder,
     onCompleteOrder,
  }) => {

    return (
        <div className="order-action-bar-root">
          <button type="button" className="btn btn-blue" onClick={onOpenCallOrder}>
            임의호출
          </button>
          <button type="button" className="btn btn-orange">
            품절
          </button>
          <div className="count-wrap">
            <div className="label">{STRINGS.selected_order_no}</div>
            <button type="button" className="count-btn">{selectedOrderNo || ''}</button>
          </div>

          <button type="button" className="btn btn-blue" onClick={onCallOrder}>
            Call(호출)
          </button>
          <button type="button" className="btn btn-orange" onClick={onCompleteOrder}>
            완료
          </button>

          <div className="count-wrap">
            <div className="label">{STRINGS.total_order_cnt}</div>
            <button type="button" className="count-btn">{orderCnt}</button>
          </div>
        </div>
        )
}

export default OrderActionBar;
