import React, { useEffect, useState } from 'react';
import './History.scss';
import ConfirmDialog from '@Components/common/ConfirmDialog';
import * as api from '@Components/data/api/api';
import { log } from '@Components/utils/logUtil';
import { useUserStore } from '@Components/store/user';
import { STRINGS } from '../../../../constants/strings';
import Alert from '@Components/common/Alert';

interface HistoryProps {
  saleDt: string;
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ saleDt, isOpen, onClose }) => {
  const ITEMS_PER_PAGE = 15;
  const [selectedOrder, setSelectedOrder] = useState({});
  const [orderList, setOrderList] = useState([]);
  const user = useUserStore((state) => state.user);
  const totalDtCount = orderList.reduce((sum, hd) => sum + (hd.orderDtList?.length || 0), 0);
  const [currentPage, setCurrentPage] = useState(0);
  const flatOrderRows = orderList.flatMap((hd) =>
    hd.orderDtList.map((dt) => ({
      hd,
      dt,
    }))
  );
  const currentItems = flatOrderRows.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const totalPages = Math.max(1, Math.ceil(flatOrderRows.length / ITEMS_PER_PAGE));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if(isOpen) {
      getCompletedOrderList()
    }

  },[isOpen])

  const getCompletedOrderList = async() => {
    console.log("cmpCd:"+user.cmpCd+", storCd:"+user.storCd+", cornerCd:"+user.cornerCd)
    const orderList = await window.ipc.order.getCompletedList(
      saleDt, user?.cmpCd, user?.salesOrgCd, user?.storCd, user?.cornerCd
    )
    console.log("완료주문:"+JSON.stringify(orderList))
    console.log("totalDtCount:"+totalDtCount)
    if(orderList!=null) {
      setOrderList(orderList);
      setCurrentPage(0);
    }

  }

  const openDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmProps({ title, message, onConfirm });
    setConfirmOpen(true);
  };
  const onRestore = () => {
    if (selectedOrder && selectedOrder.orderNoC) {
      openDialog(
        '주문 복원',
        selectedOrder.orderNoC+'번 주문을\n복원하시겠습니까?',
        () => {
          console.log('주문 복원 실행 selectedOrder:'+JSON.stringify(selectedOrder));
          // 호출 로직
          const request = {
            cmpCd: selectedOrder.cmpCd,
            salesOrgCd: selectedOrder.salesOrgCd,
            storCd: selectedOrder.storCd,
            cornerCd: selectedOrder.cornerCd,
            saleDt: selectedOrder.saleDt,
            posNo: selectedOrder.posNo,
            tradeNo: selectedOrder.tradeNo,
            status: STRINGS.status_pending,    //조리시작
          };
          api.updateOrderStatus(request).then((result) => {
            const { responseBody, responseCode, responseMessage } = result.data;
            log("data:" + JSON.stringify(result.data))
            if (responseCode === '200') {
              if (responseBody != null) {
                log("주문 복원 성공")
                window.ipc.order.updateOrderStatus(
                  STRINGS.status_pending,
                  selectedOrder.saleDt,
                  selectedOrder.cmpCd,
                  selectedOrder.salesOrgCd,
                  selectedOrder.storCd,
                  selectedOrder.cornerCd,
                  selectedOrder.posNo,
                  selectedOrder.tradeNo,
                  ''
                ).then(() => {
                  log("주문 상태 업데이트 완료")
                  getCompletedOrderList()
                  setSelectedOrder({})
                })
              } else {
                log("주문 복원 실패")
              }
            }
          })
            .catch(ex => {
              log("ErrorCode :: " + ex + "\n")
              setErrorMessage("주문 복원에 실패했습니다.\n다시 시도해주세요.")
            })
            .finally(() => {
              log("완료")
              setConfirmOpen(false)
            })
        }
      );
    }
  }
  const onNextPage = () => {

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
    console.log("현재 페이지:"+currentPage)
  };

  const onPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    console.log(`현재 페이지:${currentPage}`);
  };

  const formatTime = (timeStr?: string) => {
    return timeStr?.length === 6
      ? `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`
      : '--:--:--';
  };


  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음
  console.log('History');
  return (
    <div className="restore-query-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">조회 복원</div>
          <button className="close-button" onClick={onClose}>X</button>
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
            {currentItems.map((row, index) => {
              const { hd, dt } = row;
              const globalIndex = currentPage * ITEMS_PER_PAGE + index + 1;
              const isFirst = index === 0 || currentItems[index - 1].hd.orderNoC !== hd.orderNoC;

              return (
                <tr
                  key={`${hd.orderNoC}-${dt.seq}`}
                  className={`${selectedOrder.orderNoC === hd.orderNoC ? 'selected' : ''}
          ${globalIndex % 2 === 0 ? 'even-row' : 'odd-row'}
        `}
                  onClick={() => setSelectedOrder(hd)}
                >
                  <td>{globalIndex}</td>
                  {isFirst ? (
                    <>
                      <td>{hd.posNo}</td>
                      <td>{hd.orderNoC}</td>
                      <td>{formatTime(hd.ordTime)}</td>
                      <td>{formatTime(hd.comTime)}</td>
                    </>
                  ) : (
                    <>
                      <td />
                      <td />
                      <td />
                      <td />
                    </>
                  )}
                  <td>{dt.seq}</td>
                  <td>
                    {dt.itemDiv !== "0" ? '↳' : ''}
                    {dt.itemNm}
                  </td>
                  <td>{dt.saleQty}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <div className="invisible-button" />
          <div className="footer__pagination">
            <button type="button" className="footer__arrow" onClick={onPrevPage}>
              <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
                <path d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round" />
              </svg>
            </button>
            <div className="footer__page">
              {currentPage + 1} / {totalPages}
            </div>
            <button type="button" className="footer__arrow" onClick={onNextPage}>
              <svg className="footer__arrow" viewBox="0 0 8 14" fill="none">
                <path d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <button className="restore-button" onClick={onRestore}>
            {STRINGS.restore}
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
      {errorMessage && (
        <Alert
          title={STRINGS.alert}
          message={errorMessage}
          onClose={()=>{setErrorMessage(null)}}
        />
      )}
    </div>
  );
};

export default History;
