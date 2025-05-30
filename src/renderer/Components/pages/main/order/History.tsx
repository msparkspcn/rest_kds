import React, { useEffect, useState } from 'react';
import './History.scss';
import ConfirmDialog from '@Components/common/ConfirmDialog';

interface HistoryProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 함수
  data: Order[]; // 전달받는 데이터
}

type Order = {
  no: number;
  pos: string;
  orderNo: string;
  orderDateTime: string;
  completionDateTime: string;
  seq: string;
  menuName: string;
  quantity: number;
};

const History: React.FC<HistoryProps> = ({ isOpen, onClose, data }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order>({
    no: 0,
    pos: '',
    orderNo: '',
    orderDateTime: '',
    completionDateTime: '',
    seq: '',
    menuName: '',
    quantity: 1,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  useEffect(() => {
    setSelectedOrder({
      no: 0,
      pos: '',
      orderNo: '',
      orderDateTime: '',
      completionDateTime: '',
      seq: '',
      menuName: '',
      quantity: 1,
    });
  }, []);
  const openDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmProps({ title, message, onConfirm });
    setConfirmOpen(true);
  };
  const onRestore = () => {
    if (selectedOrder && selectedOrder.orderNo) {
      openDialog('주문 호출', `${selectedOrder.orderNo}번 주문을\n복원하시겠습니까?`, () => {
        console.log('주문 복원 실행');
        // 호출 로직
      });
    }
  };
  const onNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
    console.log(`현재 페이지:${currentPage}`);
  };

  const onPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    console.log(`현재 페이지:${currentPage}`);
  };
  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음
  console.log('History');
  return (
    <div className="restore-query-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">조회 복원</div>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>POS</th>
                <th>주문번호</th>
                <th>주문일시</th>
                <th>완료일시</th>
                <th>SEQ</th>
                <th>매뉴명</th>
                <th>수량</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.orderNo}
                  className={selectedOrder.orderNo === item.orderNo ? 'selected' : ''}
                  onClick={() => {
                    setSelectedOrder(data[index]);
                  }}
                >
                  <td>{item.no}</td>
                  <td>{item.pos}</td>
                  <td>{item.orderNo}</td>
                  <td>{item.orderDateTime}</td>
                  <td>{item.completionDateTime}</td>
                  <td>{item.seq}</td>
                  <td>{item.menuName}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <div className="invisible-button" />
          <div className="footer__pagination">
            <button type="button" className="footer__arrow" onClick={onPrevPage}>
              <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
                <path
                  d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="footer__page">
              {currentPage + 1} / {totalPages}
            </div>
            <button type="button" className="footer__arrow" onClick={onNextPage}>
              <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
                <path
                  d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <button className="restore-button" onClick={onRestore}>
            복원
          </button>
        </div>
      </div>
      {confirmOpen && (
        <ConfirmDialog
          confirmOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          {...confirmProps}
        />
      )}
    </div>
  );
};

export default History;
