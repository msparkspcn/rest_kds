import React from 'react';
import { useState, useEffect } from 'react';
import * as api from "@Components/api/api";
import './Soldout.scss';

interface SoldoutProps {
  isOpen: boolean;
  onClose: () => void;

}
//좌측 코너별 판매, 품절 상품
//우측 코너별 상품 목록
const Soldout: React.FC<SoldoutProps> = ({isOpen, onClose}) => {
  if (!isOpen) return null;
  useEffect(() => {

  })

  const getCornerItemInfo = () => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      sectionCd: '',
      useYn: 'Y',
    };
    api.getKdsMstSectionItemList(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log('### 5-2 Section Item 마스터 수신 완료 ###');
          // setSectionItemList(responseBody);
        }
      })
      .catch((e) => {
      // Alert.alert("!", e.message);
    })
      .finally(() => {
        console.log('### 5-2 완료');
        // setLoading(false);
      });
  }
  return (
    <div className="restore-query-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">품절</div>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <div className="modal-header">
          <div className="modal-title">주문에 대한 품절 관리 화면</div>
          <button type="button" className="btn btn-orange" onClick={onClose}>저장</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
            <tr>
              <th>No</th>
              <th>매장명</th>
              <th>판매</th>
              <th>품절</th>
            </tr>
            </thead>
            <tbody>
            {/*{data.map((item) => (*/}
            {/*  <tr key={item.orderNo}>*/}
            {/*    <td>{item.no}</td>*/}
            {/*    <td>{item.cornerNm}</td>*/}
            {/*    <td></td>*/}
            {/*    <td></td>*/}
            {/*  </tr>*/}
            {/*))}*/}
            </tbody>
          </table>
          <table className="data-table">
            <thead>
            <tr>
              <th>No</th>
              <th>상품코드</th>
              <th>상품명</th>
              <th>판매가</th>
              <th>품절여부</th>
            </tr>
            </thead>
            <tbody>
            {/*{data.map((item) => (*/}
            {/*  <tr key={item.orderNo}>*/}
            {/*    <td>{item.no}</td>*/}
            {/*    <td>{item.productCd}</td>*/}
            {/*    <td>{item.productNm}</td>*/}
            {/*    <td>{item.price}</td>*/}
            {/*    <td>{item.soldoutYn}</td>*/}
            {/*  </tr>*/}
            {/*))}*/}
            </tbody>
          </table>
        </div>
        {/*<div className="modal-footer">*/}
        {/*  <button className="restore-button" onClick={onRestore}>복원</button>*/}
        {/*  <div className="pagination">*/}
        {/*    /!*{currentPage + 1}/{totalPages}*!/*/}
        {/*    1/3*/}
        {/*  </div>*/}
        {/*  <button className="next-button" onClick={() => /!* 다음 페이지 로직 *!/}>다음</button>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

export default Soldout;
