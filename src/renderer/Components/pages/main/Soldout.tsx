import React from 'react';
import { useState, useEffect } from 'react';
import * as api from "@Components/api/api";
interface SoldoutProps {

  onClose: () => void;

}
//좌측 코너별 판매, 품절 상품
//우측 코너별 상품 목록
const Soldout: React.FC<SoldoutProps> = ({onClose}) => {

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
    <div>

    </div>
  )
}

export default Soldout;
