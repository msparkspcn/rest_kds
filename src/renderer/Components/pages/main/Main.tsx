import { useEffect, useState } from 'react';
import Contents from '@Components/pages/main/Contents';
import OrderActionBar from '@Components/pages/main/order/OrderActionBar';
import Footer from '@Components/pages/main/Footer';
import * as api from "@Components/api/api";
import './Main.scss';


function Main(): JSX.Element {
  const [orderCount, setOrderCount] = useState(0);
  const [section, setSection] = useState({});
  const [sectionItemList, setSectionItemList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [systemType, setSystemType] = useState('1');
  const [filterList, setFilterList] = useState([]);

  useEffect(() => {
    getKdsMstSectionItemList('10000');
  }, []);

  const arraysEqual = (arr1: string | any[], arr2: string | any[]) => {
    if (arr1.length === 0 && arr2.length > 0) return false;
    if (arr1.length < arr2.length) {
      for (let i = 0; i < arr1.length; i += 1) {
        if (arr1[i].orderNo !== arr2[i].orderNo) return false;
      }
    }
    return true;
  };

  const getOrderData = () => {
    // const {cmpCd, brandCd, storeCd} = store;
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      saleDt: '20250327',
      state: '0',
    };

    console.log('### 5-1 주문내역 수신');
    api
      .getOrderDataList(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log(`### 5-1 주문내역 수신 완료 res:${JSON.stringify(responseBody)}`);
          setOrderList(responseBody);
          if (!arraysEqual(orderList, responseBody)) {
            console.log('### 5-1 주문내역 변경점이 있으므로 갱신');
            // playSound();
          }
          setOrderCount(responseBody.length);
        } else {
          // Alert.alert("!", responseMessage);
        }
      })
      .catch((e) => {
        // Alert.alert("!", e.message);
      })
      .finally(() => {
        console.log('### 5-1 완료');
        // setLoading(false);
      });
  };

  const onRefresh = () => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      saleDt: '20250327',
    };
    console.log('### refresh call() ###');
    api
      .getOrderDataList(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log('### refresh complete ###');
          setOrderList(responseBody);
        } else {
          // Alert.alert("!", responseMessage);
        }
      })
      .catch((e) => {
        // Alert.alert("!", e.message);
      })
      .finally(() => {
        // setLoading(false);
      });
  };

  const getKdsMstSectionItemList = (sectionCd: string) => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      sectionCd,
      useYn: 'Y',
    };

    console.log('### 5-2 Section 일 경우 Section Item 마스터 수신 ###');
    api
      .getKdsMstSectionItemList(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log('### 5-2 Section Item 마스터 수신 완료 ###');
          setSectionItemList(responseBody);
          // 기본 구성이 끝나고 주문 정보를 가져온다
          getOrderData();
        } else {
          // Alert.alert("!", responseMessage);
        }
      })
      .catch((e) => {
        // Alert.alert("!", e.message);
      })
      .finally(() => {
        console.log('### 5-2 완료');
        // setLoading(false);
      });
  };

  useEffect(() => {
    console.log('### 6. 주문정보 갱신 ###');
    console.log('### 시스템 구분 :: ', systemType);
    if (systemType === '0') {
      // EXPO
      setFilterList(orderList);
    } else if (systemType === '1') {
      // Section
      // 섹션별 아이템코드 추출
      const sectionItemCdList = sectionItemList.map((item) => item.productCd);

      // 주문내역 필터링
      const filterOrderArray = orderList
        .map((order) => ({
          ...order,
          orderDtList: order.orderDtList.filter((product) =>
            sectionItemCdList.includes(product.productCd),
          ),
        }))
        .filter((item) => item.orderDtList.some((order) => order.kdsState !== '9'));
      console.log('### filter :: ', filterOrderArray);

      setFilterList(filterOrderArray);
    }
  }, [orderList, sectionItemList, systemType]);

  return (
    <div className="layout-root">
      <div className="layout-content">
        <Contents
          className="contents"
          orderList={filterList}
          onRefresh={onRefresh}
        />
      </div>
      <OrderActionBar orderCnt={orderCount} />
      <Footer />
    </div>
  );
}

export default Main;
