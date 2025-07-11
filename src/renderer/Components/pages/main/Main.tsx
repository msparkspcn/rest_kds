import React, { useEffect, useState } from 'react';
import Contents from '@Components/pages/main/Contents';
import OrderActionBar from '@Components/pages/main/order/OrderActionBar';
import Footer from '@Components/pages/main/Footer';
import * as api from '@Components/data/api/api';
import './Main.scss';
import InputPassword from '@Components/common/InputPassword';
import { useNavigate } from 'react-router-dom';
import History from '@Components/pages/main/order/History';
import CallOrderDialog from '@Components/pages/main/CallOrderDialog';
import ConfirmDialog from '@Components/common/ConfirmDialog';
import SoldOut from '@Components/pages/main/SoldOut';
import { useWebSocket } from '@Components/hooks/useWebSocket';
import Alert from '@Components/common/Alert';
import { log } from '@Components/utils/logUtil';
import { STRINGS } from '../../../constants/strings';
import Loading from '@Components/common/Loading';
import { getPlatform } from '@Components/utils/platform';
import { useUserStore } from '@Components/store/user';

function Main(): JSX.Element {
  const [orderCount, setOrderCount] = useState(0);
  const [orderList, setOrderList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>('');
  const [saleDt, setSaleDt] = useState('');
  const [callOrderOpen, setCallOrderOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isSoldOutOpen, setSoldOutOpen] = useState(false);
  let systemType: number = 0;

  const { isConnected, messages } = useWebSocket();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    console.log("user:"+JSON.stringify(user));
    if(user!=null) {
      getProductList(user.cmpCd, user.salesOrgCd, user.storCd)
    }
    // getProductList();
  }, []);

  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) {
      console.log('빈 객체입니다');
      return;
    }
    log('0.message 길이:'+messages.length)
    log('0.message:'+JSON.stringify(messages))

    messages.forEach((msg) => {
      switch (msg.type) {
        case 'SOLDOUT':
          log('1.품절 처리:' + JSON.stringify(msg.body));
          // console.log('1.품절 처리:' + JSON.stringify(msg.body));

          Promise.all(
            msg.body.map((body) =>
              window.ipc.product.updateSoldout(body.itemCd, body.soldoutYn)
            )
          )
            .then(() => {
              console.log('품절 처리 완료:');
            })
            .catch((err) => {
              console.error('품절 처리 중 오류 발생:', err);
              setErrorMessage('품절 처리에 실패했습니다.\n다시 시도해주세요.');
            });
          break;

        case 'order':
          log('2.주문 처리')
          Promise.all(
            msg.body.map(async (body) => {
                await window.ipc.order.addOrderHd(body.saleDt, body.cmpCd,
                  body.salesOrgCd, body.storCd, body.cornerCd, body.posNo, body.tradeNo,
                  body.orgTime, body.comTime, body.status, body.orderNoC, body.updUserId, body.updDate
                );
                await Promise.all(
                  (body.details || []).map((dt) =>
                    window.ipc.order.addOrderDt(
                      dt.saleDt, dt.cmpCd, dt.salesOrgCd, dt.storCd,
                      dt.cornerCd, dt.posNo, dt.tradeNo, dt.seq,
                      dt.itemPluCd, dt.itemNm, dt.itemDiv,
                      dt.setMenuCd, dt.saleQty
                    )
                  )
                );
              }
            )
          )
            .then(() => {
              console.log('주문 처리 완료:');
              const orderList = window.ipc.order.getOrderList(
                "20250623", user?.cmpCd, user?.salesOrgCd, user?.storCd, user?.cornerCd);
              // setFilterList(orderList);
            })
            .catch((err) => {
              console.error('주문 처리 중 오류 발생:', err);
              setErrorMessage('주문 처리에 실패했습니다.\n다시 시도해주세요.');
            });
          break;

        default:
          console.warn('지원되지 않는 메시지 타입:', msg.type);
          break;
      }
    });


  }, [messages]);

  useEffect(() => {
    console.log('### 시스템 구분 :: ', systemType);
    console.log("주문목록:"+orderList.length);
    getOrderData("20250612");
    // if (systemType === 0) {
    //   // EXPO
    //   setFilterList(orderList);
    // } else if (systemType === 1) {
    //   // Section
    //   // 섹션별 아이템코드 추출
    //   const sectionItemCdList = productList.map((item) => item.itemCd);
    //
    //   // 주문내역 필터링
    //   const filterOrderArray = orderList
    //     .map((order) => ({
    //       ...order,
    //       orderDtList: order.orderDtList.filter((product) =>
    //         sectionItemCdList.includes(product.itemCd),
    //       ),
    //     }))
    //     .filter((item) => item.orderDtList.some((order) => order.kdsState !== '9'));
    //   console.log('### filter :: ', filterOrderArray);
    //
    //   setFilterList(filterOrderArray);
    // }
  }, [orderList]);

  useEffect(() => {
    console.log(`페이지 변경:${currentPage}`);
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

  const getProductList = async (cmpCd: string, salesOrgCd: string, storCd: string) => {
    console.log(`상품 조회:${cmpCd}, ${salesOrgCd}, ${storCd}`);
    const params = {
      cmpCd: cmpCd,
      salesOrgCd: salesOrgCd,
      storCd: storCd,
      cornerCd: ''
    };
    try {
      const result = await api.getProductList(params);
      const { responseBody, responseCode, responseMessage } = result.data;

      if (responseCode === '200') {
        if(responseBody!=null) {
          log("상품 조회 성공")
          for (const product of responseBody) {
            if(getPlatform()==='electron') {
              const {cmpCd, salesOrgCd, storCd, cornerCd,
                itemCd, itemNm, price, soldoutYn, useYn, sortOrder} = product;
              console.log("product:"+JSON.stringify(product))
              await window.ipc.product.add(cmpCd, salesOrgCd, storCd, cornerCd, itemCd, itemNm, price, soldoutYn, useYn, sortOrder)
            }
            else {
              log("웹 환경입니다.")
            }
          }

          log(`상품 수:${responseBody.length}`);
        }

        // setSaleDt(responseBody.saleDt);
        // getOrderData(responseBody.saleDt);
      }
      else {
        window.alert("ErrorCode :: " + responseCode + "\n" + responseMessage);
      }
    }
    catch(error) {
      window.alert("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error);
    }
    finally {
      console.log('상품 insert 완료'+storCd);
      const productList = await window.ipc.product.getList(
        cmpCd, salesOrgCd, storCd, '')
      console.log("상품 목록",JSON.stringify(productList))
      setLoading(false);
    }
  };

  const getStoreSaleOpen = () => {
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281'
    };
    api.getStoreSaleOpen(params).then((result) => {
      const { responseBody, responseCode, responseMessage } = result.data;
      if (responseCode === '200') {
        console.log(`### 개점정보 res:${responseBody.saleDt}`);
        setSaleDt(responseBody.saleDt);
        getOrderData(responseBody.saleDt);
      } else {
        console.log('### 개점정보 수신 실패');
      }
    });
  };

  const getOrderData = (saleDt: string) => {
    // const {cmpCd, brandCd, storeCd} = store;
    console.log(`개점일:${saleDt}`);
    const params = {
      cmpCd: '90000001',
      brandCd: '9999',
      storeCd: '000281',
      saleDt: saleDt,
      state: '0',
    };

    console.log('### 5-1 주문내역 수신');
    setLoading(true);
    api
      .getOrderDataList(params)
      .then((result) => {
        const { responseBody, responseCode, responseMessage } = result.data;
        if (responseCode === '200') {
          // console.log(`### 5-1 주문내역 수신 완료 res:${JSON.stringify(responseBody)}`);

          if (!arraysEqual(orderList, responseBody)) {
            console.log('### 5-1 주문내역 변경점이 있으므로 갱신');
            // playSound();
            setOrderList(responseBody);
          }
          console.log(`페이징:${responseBody.length}`);
          // ITEMS_PER_PAGE)
          setOrderCount(responseBody.length);
          console.log(`orderCnt:${responseBody.length}, ITEMS_PER_PAGE:${ITEMS_PER_PAGE}`);
          if (responseBody.length / ITEMS_PER_PAGE > 0) {
            console.log(`1이상 =${Math.ceil(responseBody.length / ITEMS_PER_PAGE)}`);
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
        setLoading(false);
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

  const onSetting = () => {
    console.info('### 설정화면 진입 시도 ###');
    setPasswordOpen(true);
  };

  const goSettingPage = () => {
    console.log('비밀번호 인증 성공! 설정 페이지로 이동');
    setPasswordOpen(false);
    navigate('/setting', { replace: true });
  };
  const [isModalOpen, setModalOpen] = useState(false);

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
  const data =
    [
      {
        "no": 1,
        "pos": "91",
        "orderNo": "9100001",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 2,
        "pos": "91",
        "orderNo": "9100002",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 3,
        "pos": "91",
        "orderNo": "9100003",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 4,
        "pos": "91",
        "orderNo": "9100004",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 5,
        "pos": "91",
        "orderNo": "9100005",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 6,
        "pos": "91",
        "orderNo": "9100006",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 7,
        "pos": "91",
        "orderNo": "9100007",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 8,
        "pos": "91",
        "orderNo": "9100008",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 9,
        "pos": "91",
        "orderNo": "9100009",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 10,
        "pos": "91",
        "orderNo": "9100010",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 11,
        "pos": "91",
        "orderNo": "9100011",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 12,
        "pos": "91",
        "orderNo": "9100012",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 13,
        "pos": "91",
        "orderNo": "9100013",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 14,
        "pos": "91",
        "orderNo": "9100014",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 15,
        "pos": "91",
        "orderNo": "9100015",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 16,
        "pos": "91",
        "orderNo": "9100016",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 17,
        "pos": "91",
        "orderNo": "9100017",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 18,
        "pos": "91",
        "orderNo": "9100018",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      },
      {
        "no": 19,
        "pos": "91",
        "orderNo": "9100019",
        "orderDateTime": "11:58:17",
        "completionDateTime": "12:01:58",
        "seq": "01",
        "menuName": "돈모밀국수",
        "quantity": 1
      },
      {
        "no": 20,
        "pos": "91",
        "orderNo": "9100020",
        "orderDateTime": "11:56:28",
        "completionDateTime": "11:58:28",
        "seq": "01",
        "menuName": "옛날돈까스",
        "quantity": 1
      }
    ]

  const onOpenCallOrder = () => {
    setCallOrderOpen(true);
  };

  const openDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmProps({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  const handleOrderAction = (title: string, messagePrefix: string, callback: () => void) => {
    if (selectedOrderNo !== '') {
      openDialog(title, `${selectedOrderNo}번 주문을\n${messagePrefix}하시겠습니까?`, () => {
        console.log(`주문 ${messagePrefix} 실행`);
        callback();
      });
    } else {
      setErrorMessage('주문 번호를 선택해주세요.');
    }
  };

  const handleCallOrder = () => {
    handleOrderAction('주문 호출', '호출', () => {
      //호출 로직
    });
  };

  const handleCompleteOrder = () => {
    handleOrderAction('주문 완료', '완료', () => {
      //완료 로직
    });
  };

  const handleCompleteOrderAll = () => {
    openDialog('주문 완료', `모든 주문을\n완료하시겠습니까?`, () => {
      console.log('전체 주문 완료 실행');
      // 완료 로직
    });
  }

  const onExitApp = () => {
    openDialog('종료', STRINGS.exit_app_msg, () => {
      console.log('종료 버튼 클릭');
      window.ipc.quitApp();
    });
  }

  const onSelectOrderHd = (orderNo: string) => {
    if (orderNo == selectedOrderNo) {
      setSelectedOrderNo('');
    } else {
      setSelectedOrderNo(orderNo); // 선택된 주문 번호 업데이트
    }
  };
  return (
    <div className="layout-root">
      {loading && <Loading />}
      <div className="layout-content">
        <Contents
          orderList={filterList}
          onRefresh={onRefresh}
          onSelectOrderHd={onSelectOrderHd}
        />
      </div>
      <div className="order-action-bar">
        <OrderActionBar
          orderCnt={orderCount}
          selectedOrderNo={selectedOrderNo}
          onOpenCallOrder={onOpenCallOrder}
          onCallOrder={handleCallOrder}
          onCompleteOrder={handleCompleteOrder}
          onSoldOut={()=>setSoldOutOpen(true)}
        />
      </div>
      <div className="footer-area">
        <Footer
          onSetting={onSetting}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          onCompleteAll={handleCompleteOrderAll}
          onRestore={() => setModalOpen(true)}
          onExitApp={onExitApp}
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
          title="주문번호 입력"
          errorMsg="주문번호를 다시 입력해주세요."
          onClose={() => setCallOrderOpen(false)}
          onCorrect={() => setCallOrderOpen(false)}
        />
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
      {isSoldOutOpen && (
        <SoldOut
          isOpen={isSoldOutOpen}
          onClose={() => setSoldOutOpen(false)}
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
}

export default Main;
