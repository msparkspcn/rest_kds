import React, { useEffect, useState } from 'react';
import Contents from '@Components/pages/main/Contents';
import OrderActionBar from '@Components/pages/main/order/OrderActionBar';
import Footer from '@Components/pages/main/Footer';
import * as api from "@Components/data/api/api";
import './Main.scss';
import InputPassword from '@Components/common/InputPassword';
import { useNavigate } from 'react-router-dom';
import History from '@Components/pages/main/order/History';
import CallOrderDialog from '@Components/pages/main/CallOrderDialog';
import ConfirmDialog from '@Components/pages/main/ConfirmDialog';
import SoldOut from '@Components/pages/main/SoldOut';

function Main(): JSX.Element {
  const [orderCount, setOrderCount] = useState(0);
  const [section, setSection] = useState({});
  const [sectionItemList, setSectionItemList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [systemType, setSystemType] = useState('1');
  const [filterList, setFilterList] = useState([]);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>("");
  const [saleDt, setSaleDt] = useState('');
  const [callOrderOpen, setCallOrderOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isSoldOutOpen, setSoldOutOpen] = useState(false);
  useEffect(() => {
    getKdsMstSectionItemList('10000');
  }, []);

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

  useEffect(() => {
    console.log("페이지 변경:"+currentPage);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setFilterList(orderList.slice(startIndex, endIndex));
  }, [orderList, currentPage]);

  const arraysEqual = (arr1: string | any[], arr2: string | any[]) => {
    if (arr1.length === 0 && arr2.length > 0) return false;
    if (arr1.length < arr2.length) {
      for (let i = 0; i < arr1.length; i += 1) {
        if (arr1[i].orderNo !== arr2[i].orderNo) return false;
      }
    }
    return true;
  };

  const getStoreSaleOpen = () => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281'
    };
    api.getStoreSaleOpen(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          console.log(`### 개점정보 res:${responseBody.saleDt}`);
          setSaleDt(responseBody.saleDt);
          getOrderData(responseBody.saleDt);
        }
        else {
          console.log('### 개점정보 수신 실패');
        }
      })
  }

  const getOrderData = (saleDt:string) => {
    // const {cmpCd, brandCd, storeCd} = store;
    console.log("개점일:"+saleDt);
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      saleDt: saleDt,
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
          console.log("페이징:"+responseBody.length);
          // ITEMS_PER_PAGE)
          setOrderCount(responseBody.length);
          console.log("orderCnt:"+responseBody.length+", ITEMS_PER_PAGE:"+ITEMS_PER_PAGE);
          if((responseBody.length / ITEMS_PER_PAGE) > 0) {
            console.log("1이상 ="+Math.ceil(responseBody.length / ITEMS_PER_PAGE));
            setTotalPages(Math.ceil(responseBody.length / ITEMS_PER_PAGE));
          }
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
          getStoreSaleOpen();
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

  const onSetting = () => {
    console.info("### 설정화면 진입 시도 ###")
    setPasswordOpen(true);
  }

  const goSettingPage = () => {
    console.log("비밀번호 인증 성공! 설정 페이지로 이동");
    setPasswordOpen(false);
    navigate("/setting", { replace: true });
  };
  const [isModalOpen, setModalOpen] = useState(false);
  const onRestore = () => {
    setModalOpen(true)
  }
  const onSoldOut = () => {
    setSoldOutOpen(true)
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
    console.log("현재 페이지:"+currentPage)
  };
  const data = [{
    no: 1,
    pos: "91",
    orderNo: "9100012",
    orderDateTime: "11:58:17",
    completionDateTime: "12:01:58",
    seq: '01',
    menuName: "돈모밀국수",
    quantity: 1
  },
    {
      no: 2,
      pos: "91",
      orderNo: "9100011",
      orderDateTime: "11:56:28",
      completionDateTime: "11:58:28",
      seq: '01',
      menuName: "옛날돈까스",
      quantity: 1
    },
  ]
  const onOpenCallOrder = () => {
    setCallOrderOpen(true)
  }

  const openDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmProps({ title, message, onConfirm });
    setConfirmOpen(true);
  };
  const handleCallOrder = () => {
    if(selectedOrderNo!='') {
      openDialog(
        '주문 호출',
        selectedOrderNo+'번 주문을\n호출하시겠습니까?',
        () => {
          console.log('주문 호출 실행');
          // 호출 로직
        }
      );
    }
  };

  const handleCompleteOrder = () => {
    if(selectedOrderNo!='') {
      openDialog(
        '주문 완료',
        selectedOrderNo+'번 주문을\n완료하시겠습니까?',
        () => {
          console.log('주문 완료 실행');
          // 완료 로직
        }
      );
    }
  };


  const onSelectOrderHd = (orderNo: string) => {
    if(orderNo==selectedOrderNo) {
      setSelectedOrderNo("")
    }
    else {
      setSelectedOrderNo(orderNo); // 선택된 주문 번호 업데이트
    }
  };
  return (
    <div className="layout-root">
      <div className="layout-content">
        <Contents
          orderList={filterList}
          onRefresh={onRefresh}
          onSelectOrderHd = {onSelectOrderHd}
        />
      </div>
      <div className="order-action-bar">
        <OrderActionBar
          orderCnt={orderCount}
          selectedOrderNo={selectedOrderNo}
          onOpenCallOrder={onOpenCallOrder}
          onCallOrder={handleCallOrder}
          onCompleteOrder={handleCompleteOrder}
          onSoldOut={onSoldOut}
        />
      </div>
      <div className="footer-area">
        <Footer
          onSetting={onSetting}
          currentPage = {currentPage}
          totalPages = {totalPages}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          onRestore={onRestore}
        />
      </div>
      {passwordOpen && (
        <InputPassword
          onClose={() => setPasswordOpen(false)}
          onCorrect={goSettingPage}
        />
      )}
      {callOrderOpen && (
        <CallOrderDialog
          title="임의호출"
          errorMsg="주문번호를 다시 입력해주세요."
          onClose={() => setCallOrderOpen(false)}
          onCorrect={() => setCallOrderOpen(false)} />
      )}
      {confirmOpen && (
        <ConfirmDialog
          confirmOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          {...confirmProps}
        />
      )}
      <History
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        data={data}
      />
      <SoldOut
        isOpen={isSoldOutOpen}
        onClose={() => setSoldOutOpen(false)}
      />
    </div>
  );
}

export default Main;
