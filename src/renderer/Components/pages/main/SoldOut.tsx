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
  availableCount: number;
  soldoutCount: number;
}
//좌측 코너별 판매, 품절 상품
//우측 코너별 상품 목록
const SoldOut: React.FC<SoldOutProps> = ({isOpen, onClose}) => {
  const [cornerList, setCornerList] = useState<Corner[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const getUser = useUserStore((state) => state.getUser);
  const [selectedCorner, setSelectedCorner] = useState<Corner>({
    cmpCd: '',
    salesOrgCd: '',
    storCd: '',
    cornerCd: '',
    cornerNm:'',
    useYn:'',
    availableCount:0,
    soldoutCount:0,
  });
  useEffect(() => {
    if (isOpen) {
      const user = getUser();
      // console.log("user:"+JSON.stringify(user))
      console.log("1user:"+user?.cmpCd+", salesOrgCd:"+user?.salesOrgCd+", storCd:"+user?.storCd)
      getLocalCornerList(user?.cmpCd, user?.salesOrgCd, user?.storCd).then(r => {});
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("Here")
    getProductList(selectedCorner);
  },[selectedCorner])

  if (!isOpen) return null;

  const getLocalCornerList = async (cmpCd: string, salesOrgCd: string, storCd: string) => {
    console.log("getLocalCornerList cmpCd:"+cmpCd+", salesOrgCd:"+salesOrgCd+", storCd:"+storCd)
    const cornerList = await window.ipc.corner.getList2(cmpCd, salesOrgCd, storCd,"1")
    console.log('코너 목록:', cornerList);
    setCornerList(cornerList)

    if (Object.keys(selectedCorner).length === 0 && cornerList.length > 0) {
      setSelectedCorner(cornerList[0]);
    }
  }

  const getProductList = async (corner: Corner) => {
    console.log("상품 조회 corner:"+JSON.stringify(corner))

    const productList = await window.ipc.product.getList(
      corner.cmpCd, corner.salesOrgCd, corner.storCd, corner.cornerCd)
    console.log('상품 목록:', productList);
    setProductList(productList)
  }

  const handleCheckboxChange = (index: number) => {
    setProductList((prevList) => {
      const updatedList = prevList.map((item, i) =>
        i === index
          ? {
            ...item,
            soldoutYn: item.soldoutYn === "1" ? "0" : "1",
          }
          : item
      );
      const targetProduct = updatedList[index]
      const request = {
        cmpCd: selectedCorner.cmpCd,
        salesOrgCd: selectedCorner.salesOrgCd,
        storCd: selectedCorner.storCd,
        cornerCd: selectedCorner.cornerCd,
        itemCd: targetProduct.itemCd.slice(0, 7),
        itemSeq: targetProduct.itemCd.slice(7),
        soldoutYn: targetProduct.soldoutYn,

      }
      console.log("request:" + JSON.stringify(request))
      api
        .updateSoldout(request)
        .then((result) => {
          const { responseCode, responseMessage, responseBody } = result.data;
          if (responseCode === '200') {
            console.log('품절여부 변경 성공 responseBody:' + JSON.stringify(responseBody));
            getLocalCornerList(selectedCorner.cmpCd, selectedCorner.salesOrgCd, selectedCorner.storCd)
          }
          else {
            window.alert(responseMessage);
          }
        })
        .catch((ex) => {
          window.alert('서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n(' + ex.message + ')');
        })

      return updatedList;
    });
  };

  return (
    <div className="soldout-modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">품절 관리</div>
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
                className={selectedCorner?.cornerCd === item.cornerCd ? 'selected' : ''}
                onClick={() => {
                  console.log(index+"번 row 선택, :"+JSON.stringify(cornerList[index]))
                  setSelectedCorner(cornerList[index])
                  getProductList(cornerList[index])
                }}
              >
                <td>{index + 1}</td>
                <td>{item.cornerNm}</td>
                <td>{item.availableCount}</td>
                <td>{item.soldoutCount}</td>
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
