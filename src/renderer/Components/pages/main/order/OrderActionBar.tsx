import React from "react";
import {STRINGS} from "../../../../constants/strings";
import './OrderActionBar.scss';

interface OrderActionBarProps {
    orderCnt: number;
}

const OrderActionBar: React.FC<OrderActionBarProps> = ({ orderCnt }) => {

    return (
        <footer className="footer">
          <button type="button" className="btn btn-blue">
            임의호출
          </button>
          <button type="button" className="btn btn-orange">
            품절
          </button>
          <div className="count-wrap">
            <div className="label">{STRINGS.selected_order_no}</div>
            <button type="button" className="count-btn">1</button>
          </div>

          <button type="button" className="btn btn-blue">
            Call(호출)
          </button>
          <button type="button" className="btn btn-orange">
            완료
          </button>

          <div className="count-wrap">
            <div className="label">{STRINGS.total_order_cnt}</div>
            <button type="button" className="count-btn">{orderCnt}</button>
          </div>
        </footer>
        )
}

export default OrderActionBar;
