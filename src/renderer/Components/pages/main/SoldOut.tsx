import React from 'react';
import { useState, useEffect } from 'react';
import * as api from "@Components/data/api/api";
import './SoldOut.scss';
import numeral from "numeral";
import { useUserStore } from '@Components/store/user';
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

type Corner = {
  cmpCd: string;
  cornerCd: string;
  cornerNm: string;
  salesOrgCd: string;
  storCd: string;
  useYn: string;
}
//좌측 코너별 판매, 품절 상품
//우측 코너별 상품 목록
const SoldOut: React.FC<SoldOutProps> = ({isOpen, onClose}) => {
  const [cornerList, setCornerList] = useState([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const getUser = useUserStore((state) => state.getUser);
  const [selectedCorner, setSelectedCorner] = useState({});
  const [selectedCornerRow, setSelectedCornerRow] = useState(null);
  useEffect(() => {
    if (isOpen) {
      const user = getUser();
      console.log("user:"+JSON.stringify(user))
      console.log("1user:"+user?.cmpCd+", cornerCd:"+user?.cornerCd)
      // getCornerList(user?.cmpCd,user?.salesOrgCd);
      getLocalCornerList(user?.cmpCd,user?.salesOrgCd, user?.cornerCd);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cornerList.length > 0) {
      console.log("cornerList.length:"+cornerList.length)
      getProductList(selectedCorner);
    }
  },[cornerList])

  if (!isOpen) return null;

  const getLocalCornerList = async (cmpCd: String, salesOrgCd: String, cornerCd: String) => {
    console.log('코너 :', cornerCd);
    const cornerList = await window.ipc.corner.getList("1")
    // const cornerList = await window.ipc.corner.getList2("1")
    console.log('코너 목록2:', cornerList);
    setCornerList(cornerList)
    setSelectedCorner(cornerList[0])
  }


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
        console.log("코너 조회 성공")
        // console.log("코너 조회 성공 responseBody:"+JSON.stringify(responseBody))
        if(responseBody!=null) {
          setCornerList(responseBody);
          getProductList(cornerList[0]);
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
  //TODO 설정화면에서 전체 product insert 후 SoldOut에서 조인되는지 확인
  const getProductList = (corner: Corner) => {
    console.log("상품 조회 corner:"+JSON.stringify(corner))
    const params = {
      cmpCd: corner.cmpCd,
      salesOrgCd: corner.salesOrgCd,
      storCd: corner.storCd,
      cornerCd: corner.cornerCd
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
        // console.log('### 개점정보 수신 실패');
      }
    })
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
        <div className="modal-desc-bar">
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
            {cornerList.map((item, index) => {
              // console.log('렌더링 아이템:', item);
              return (
              <tr
                key={item.cornerCd}
                className={selectedCornerRow === index ? 'selected' : ''}
                onClick={() => {
                  console.log(index+"번 row 선택, :"+JSON.stringify(cornerList[index]))
                  setSelectedCornerRow(index)
                  getProductList(cornerList[index])
                }}
              >
                <td>{index + 1}</td>
                <td>{item.cornerNm}</td>
                <td>1</td>
                <td>1</td>
              </tr>
              )
            })}
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
      </div>
    </div>
  )
}

export default SoldOut;
