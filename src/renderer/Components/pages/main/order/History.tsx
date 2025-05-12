import React from 'react';
import './History.scss';

interface HistoryProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 함수
  data: {
    no: number;
    pos: string;
    orderNo: string;
    orderDateTime: string;
    completionDateTime: string;
    seq: string;
    menuName: string;
    quantity: number;
  }[]; // 전달받는 데이터
}
const onRestore = () => {

}
const History: React.FC<HistoryProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음
  console.log("History");
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
            {data.map((item) => (
              <tr key={item.orderNo}>
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
          <button className="restore-button" onClick={onRestore}>복원</button>
          <div className="pagination">
            {/*{currentPage + 1}/{totalPages}*/}
            1/3
          </div>
          <button className="next-button" onClick={() => {/* 다음 페이지 로직 */}}>다음</button>
        </div>
      </div>
    </div>
  );
};

export default History;
