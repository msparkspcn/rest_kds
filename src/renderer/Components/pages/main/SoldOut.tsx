import React from 'react';
import { useState, useEffect } from 'react';
import * as api from "@Components/data/api/api";
import './SoldOut.scss';
import numeral from "numeral";
interface SoldOutProps {
  isOpen: boolean;
  onClose: () => void;

}
type Product = {
  itemCd: string;
  itemNm: string;
  price: number;
  soldoutYn: string;
}
//좌측 코너별 판매, 품절 상품
//우측 코너별 상품 목록
const SoldOut: React.FC<SoldOutProps> = ({isOpen, onClose}) => {
  const [cornerList, setCornerList] = useState([]);
  const [productList, setProductList] = useState<Product[]>([]);
  useEffect(() => {
    if (isOpen) {
      getCornerList('SLKR','8000');
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const getCornerList = (cmpCd: String, salesOrgCd: String) => {
    // setLoading(true)
    console.log("getCornerList:")
    const request = {
      cmpCd : cmpCd,
      salesOrgCd : salesOrgCd
    }
    api.getCornerList(request).then((result) => {
      const {responseCode, responseMessage, responseBody} = result.data;
      if (responseCode === "200") {
        console.log("코너 조회 성공 responseBody:"+JSON.stringify(responseBody))
        if(responseBody!=null) {
          setCornerList(responseBody);
          getProductList();
          // getKdsMstSection();
        }
      }
      else {
        window.alert("ErrorCode :: " + responseCode + "\n" + responseMessage);
      }
    })
      .catch(ex => {
        window.alert("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n(" + ex.message + ")");
      })
      .finally(() => {
      })
  }
  const getProductList = () => {
    console.log("상품 조회")
    const params = {
      cmpCd: 'SLKR',
      salesOrgCd: '8000',
      storCd: '5000511',
      cornerCd: 'CIHA'
    };
    api.getProductList(params).then((result) => {
      const { responseBody, responseCode, responseMessage } = result.data;
      if (responseCode === '200') {
        setProductList(responseBody)
        console.log(`### 상품정보 res:${responseBody}`);
        // setSaleDt(responseBody.saleDt);
        // getOrderData(responseBody.saleDt);
      }
      else {
        console.log('### 개점정보 수신 실패');
      }
    })
  }


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

  const handleCheckboxChange = (index) => {
    setProductList((prevList) =>
      prevList.map((item, i) =>
        i === index
          ? {
            ...item,
            soldoutYn: item.soldoutYn === "1" ? "0" : "1",
          }
          : item
      )
    );
  };

  return (
    <div className="soldout-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">품절</div>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        <div className="modal-header">
          <div className="modal-desc">주문에 대한 품절 관리 화면</div>
          <button type="button" className="btn btn-orange" onClick={onClose}>저장</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table summary">
            <thead>
            <tr>
              <th>No</th>
              <th>매장명</th>
              <th>판매</th>
              <th>품절</th>
            </tr>
            </thead>
            <tbody>
            {cornerList.map((item, index) => (
              <tr key={item.cornerCd}>
                <td>{index+1}</td>
                <td>{item.cornerNm}</td>
                <td>1</td>
                <td>1</td>
              </tr>
            ))}
            </tbody>
          </table>
          <table className="data-table detail">
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
            {productList.map((item, index) => (
              <tr key={item.itemCd}>
                <td>{index+1}</td>
                <td>{item.itemCd}</td>
                <td>{item.itemNm}</td>
                <td>{numeral(item.price).format("0,0")}</td>
                <td>
                  <div className="checkBox">
                    <input
                      type="checkbox" id={`check-${item.itemCd}`} // 고유 id로 변경 (중복 방지)
                      checked={item.soldoutYn === "1"}
                      onChange={() => handleCheckboxChange(index)}
                    />
                    <div className="checkDefault" />
                  </div>
                </td>
              </tr>
            ))}
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

export default SoldOut;
