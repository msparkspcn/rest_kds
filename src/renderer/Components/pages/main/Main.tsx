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
import dayjs from 'dayjs';

interface OrderItem {
  itemNm: string;
  saleQty: number;
}

interface OrderData {
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  cornerCd: string;
  posNo: string;
  tradeNo: string;
  orderNoC: string;
  ordTime: string;
  orderDtList: OrderItem[];
}

function Main(): JSX.Element {
  const [orderCount, setOrderCount] = useState(0);
  const [orderList, setOrderList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<{} | null>('');
  const [saleDt, setSaleDt] = useState('');
  const [callOrderOpen, setCallOrderOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isSoldOutOpen, setSoldOutOpen] = useState(false);

  const { isConnected, messages } = useWebSocket();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useUserStore((state) => state.user);
  const platform = getPlatform();
  useEffect(() => {
    console.log("user:"+JSON.stringify(user));
    //최초 주문 수신 api 필요 getOrderList
    if(user!=null) {
      getOpenDate(user.cmpCd, user.salesOrgCd, user.storCd)
      getProductList(user.cmpCd, user.salesOrgCd, user.storCd)
    }
  }, []);

  useEffect(() => {
    const processMessages = async () => {
      if (!Array.isArray(messages) || messages.length === 0) {
        console.log('빈 객체입니다');
        return;
      }
      log('0.message:'+JSON.stringify(messages))

      for(const msg of messages) {
        switch (msg.type) {
          case 'SOLDOUT':
            log('1.품절 처리:' + JSON.stringify(msg.body));
            // console.log('1.품절 처리:' + JSON.stringify(msg.body));
            try {
              await Promise.all(
                msg.body.map((body) =>
                  window.ipc.product.updateSoldout(body.itemCd, body.soldoutYn)
                )
              )
              console.log('품절 처리 완료:');
            } catch(err) {
              console.error('품절 처리 중 오류 발생:', err);
              setErrorMessage('품절 처리에 실패했습니다.\n다시 시도해주세요.');
            }
            break;

          case 'order':
            log('2.주문 처리' + JSON.stringify(msg.body))
            if(msg.body!=null) {
              try {
                const body = msg.body;
                const cornerCd = body.cornerCd ?? '';
                const details = body.details || [];

                await window.ipc.order.addOrderHd(
                  body.saleDt, body.cmpCd, body.salesOrgCd, body.storCd,
                  cornerCd,
                  body.posNo, body.tradeNo,
                  body.ordTime, body.comTime, body.status,
                  body.orderNoC ?? '',
                  body.updUserId ?? 'SYSTEM',
                  body.updDate ?? ''
                );

                // 주문 상세 저장
                await Promise.all(details.map(dt =>
                  window.ipc.order.addOrderDt(
                    dt.saleDt, dt.cmpCd, dt.salesOrgCd, dt.storCd,
                    dt.cornerCd, dt.posNo, dt.tradeNo, dt.seq,
                    dt.itemPluCd, dt.itemNm, dt.itemDiv,
                    '', dt.saleQty
                  )
                ));

                handleOrderStatus(
                  body.cmpCd,
                  body.salesOrgCd,
                  body.storCd,
                  cornerCd,
                  body.saleDt,
                  body.posNo,
                  body.tradeNo,
                  STRINGS.status_pending);

                const orderHdList = await window.ipc.order.getList(
                  body.saleDt, body.cmpCd, body.salesOrgCd, body.storCd,cornerCd);

                setOrderList(orderHdList);

                console.log('내부 db insert 완료 orderHd12:', orderHdList);
                console.log('주문 처리 완료');
              }
              catch(err) {
                console.error('주문 처리 중 오류 발생:', err);
                setErrorMessage('주문 처리에 실패했습니다.\n다시 시도해주세요.');
              }
            }
            break;

            default:
              console.warn('지원되지 않는 메시지 타입:', msg.type);
              break;
        }
      }
    };
    processMessages();
  }, [messages]);

  useEffect(() => {
    console.log("주문목록:"+orderList.length);
    // getOrderData("20250715");
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

  const getOrderList = async (
    cmpCd: string,
    salesOrgCd: string,
    storCd: string,
    cornerCd: string,
    saleDt: string,
    ) => {
    const request = {
      cmpCd : cmpCd,
      salesOrgCd : salesOrgCd,
      storCd : storCd,
      cornerCd : cornerCd,
      searchDt : saleDt,
    }
    try {
      const result = await api.getOrderList(request);
      const {responseCode, responseMessage, responseBody} = result.data;
      if(responseCode === "200") {
        if(responseBody!=null) {
          log("주문목록:"+JSON.stringify(responseBody))
          for(const body of responseBody) {
            const details = body.details || [];
            if(platform==='electron') {

              await window.ipc.order.addOrderHd(
                body.saleDt, body.cmpCd, body.salesOrgCd, body.storCd,
                body.cornerCd,
                body.posNo, body.tradeNo,
                body.ordTime, body.comTime, body.status,
                body.orderNoC ?? '',
                body.updUserId ?? 'SYSTEM',
                body.updDate ?? ''
              );

              await Promise.all(details.map(dt =>
                window.ipc.order.addOrderDt(
                  dt.saleDt, dt.cmpCd, dt.salesOrgCd, dt.storCd,
                  dt.cornerCd, dt.posNo, dt.tradeNo, dt.seq,
                  dt.itemPluCd, dt.itemNm, dt.itemDiv,
                  '', dt.saleQty
                )
              ));
            } else {
              log("웹 환경입니다.")
            }
          }
          log("주문목록 등록완료")
          getOrderData(saleDt)
        }
      }
    }
    catch {

    }
  }

  const getOpenDate = async (cmpCd: string, salesOrgCd: string, storCd: string) => {
    log("개점일 조회")
    const request = {
      cmpCd : cmpCd,
      salesOrgCd : salesOrgCd,
      storCd : storCd,
    }
    try {
      const result = await api.getOpenDate(request);
      const {responseCode, responseMessage, responseBody} = result.data;
      if (responseCode === "200") {
        if(responseBody!=null) {
          log("개점일:"+responseBody)

          if(platform==='electron') {
            // console.log("cmpCd:"+cmpCd);
            await window.ipc.saleOpen.add(cmpCd, salesOrgCd, storCd, responseBody.openDt);
            setSaleDt(responseBody.openDt)
            getOrderList(cmpCd, salesOrgCd, storCd, user?.cornerCd, responseBody.openDt)
            log("개점일 등록완료")
          } else {
            log("웹 환경입니다.")
          }
        }
      }
      else {
        log("개점일 조회 실패. local db 조회")
        const saleOpen = await window.ipc.saleOpen.getSaleOpen(cmpCd, salesOrgCd, storCd);
        log("개점일2:"+JSON.stringify(saleOpen))
        if(saleOpen) {
          // log("개점일2:"+saleOpen)
          setSaleDt(saleOpen.saleDt)
          getOrderData(saleOpen.saleDt)
        }
        else {
          log("개점일 조회 실패(최종)")
        }
      }
    } catch (e) {

    }
    setLoading(false);
  }

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
          log("상품 조회 성공 :"+JSON.stringify(responseBody))
          for (const product of responseBody) {
            if(getPlatform()==='electron') {
              const {cmpCd, salesOrgCd, storCd, cornerCd,
                itemCd, itemNm, price, soldoutYn, useYn, sortOrder} = product;
              // console.log("product:"+JSON.stringify(product))
              await window.ipc.product.add(
                cmpCd, salesOrgCd, storCd, cornerCd,
                itemCd, itemNm, price, soldoutYn, useYn, sortOrder)
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
        cmpCd, salesOrgCd, storCd, 'CIHA')
      console.log("상품 목록",JSON.stringify(productList))
      setLoading(false);
    }
  };

  const getOrderData = async(saleDt: string) => {
    //주문정보 내부 쿼리 후 주문건수, 주문 set
    // const {cmpCd, brandCd, storeCd} = store;
    console.log("getOrderData saleDt:" + saleDt + ", cmpCd:" + user.cmpCd
      + ", storCd:" + user.storCd + ", cornerCd:" + user.cornerCd)
    const orderHdList = await window.ipc.order.getList(
      saleDt,
      user.cmpCd,
      user.salesOrgCd,
      user.storCd,
      user.cornerCd);
    setOrderCount(orderHdList.length)
    setOrderList(orderHdList);

    console.log("주문목록1:"+JSON.stringify(orderHdList));


    if (orderHdList.length / ITEMS_PER_PAGE > 0) {
      console.log(`1이상 =${Math.ceil(orderHdList.length / ITEMS_PER_PAGE)}`);
      setTotalPages(Math.ceil(orderHdList.length / ITEMS_PER_PAGE));
    }
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

  const onOpenCallOrder = () => {
    setCallOrderOpen(true);
  };

  const openDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmProps({ title, message, onConfirm });
    setConfirmOpen(true);
  };

  const handleOrder = (
    title: string,
    prefix: string,
    status: string
  ) => {
    if (!selectedOrder.orderNoC) {
      setErrorMessage('주문 번호를 선택해주세요.');
      return;
    }
    openDialog(
      title,
      `${selectedOrder.orderNoC}번 주문을\n${prefix}하시겠습니까?`,
      async () => {
        console.log(`주문 ${prefix} 실행`);
        try {
          await handleOrderStatus(
            selectedOrder.cmpCd,
            selectedOrder.salesOrgCd,
            selectedOrder.storCd,
            selectedOrder.cornerCd,
            selectedOrder.saleDt,
            selectedOrder.posNo,
            selectedOrder.tradeNo,
            status
          );
        } catch (error) {
          log("주문 처리 중 오류:", error);
        } finally {
          setConfirmOpen(false);
        }
      }
    );
  }

  const handleOrderStatus = async (
    cmpCd:string,
    salesOrgCd:string,
    storCd:string,
    cornerCd:string,
    saleDt:string,
    posNo:string,
    tradeNo:string,
    status:string
  ) => {
    try {
      const request = {
        cmpCd: cmpCd,
        salesOrgCd: salesOrgCd,
        storCd: storCd,
        cornerCd: cornerCd,
        saleDt: saleDt,
        posNo: posNo,
        tradeNo: tradeNo,
        status: status,
      };
      const result = await api.updateOrderStatus(request);
      const { responseBody, responseCode, responseMessage } = result.data;
      log("data:" + JSON.stringify(result.data));
      console.log("status:"+status)
      if (responseCode === '200') {
        if (responseBody != null) {
          // log(successLog);

          try {
            if(status==STRINGS.status_completed) {
              const currentTime = dayjs().format('HHmmss');
              await window.ipc.order.updateOrderStatus(
                status, saleDt, cmpCd, salesOrgCd, storCd, cornerCd, posNo, tradeNo, currentTime
              );
            }
            else {
              await window.ipc.order.updateOrderStatus(
                status, saleDt, cmpCd, salesOrgCd, storCd, cornerCd, posNo, tradeNo
              );
            }

            log("주문 상태 업데이트 완료");
            getOrderData(saleDt)
          } catch (error) {
            log("주문 상태 업데이트 실패: " + error);
          }

        } else {
          // log(failureLog);
        }
      } else {
        log("API 응답 실패: " + responseMessage);
      }
    } catch (ex) {
      window.alert("ErrorCode :: " + ex + "\n");
    } finally {
      setSelectedOrder({})
    }
  }


  const handleCallOrder = async () => {
    console.log("selectedOrder:"+JSON.stringify(selectedOrder))
    handleOrder('주문 호출', '호출', STRINGS.status_call)
  };

  const handleCompleteOrder = () => {
    handleOrder('주문 완료', '완료', STRINGS.status_completed)
  };

  const handleCompleteOrderAll = () => {
    openDialog('주문 완료', `모든 주문을\n완료하시겠습니까?`, () => {
      console.log('전체 주문 완료 실행');
      // 완료 로직
    });
  }

  const handleRestoreRecent = async () => {
    const recentCompletedOrder = await window.ipc.order.getRecentCompletedOrder(
      saleDt, user?.cmpCd, user?.salesOrgCd, user?.storCd, user?.cornerCd
    ); // ✅ await
    console.log('주문:', recentCompletedOrder);
    // setSelectedOrder(recentCompletedOrder)
    // handleOrder('직전 복원','복원', STRINGS.status_pending)
    await handleOrderStatus(
      recentCompletedOrder.cmpCd,
      recentCompletedOrder.salesOrgCd,
      recentCompletedOrder.storCd,
      recentCompletedOrder.cornerCd,
      recentCompletedOrder.saleDt,
      recentCompletedOrder.posNo,
      recentCompletedOrder.tradeNo,
      STRINGS.status_pending
    )
  };

  const onExitApp = () => {
    openDialog('종료', STRINGS.exit_app_msg, () => {
      console.log('종료 버튼 클릭');
      window.ipc.quitApp();
    });
  }

  const onSelectOrderHd = (order: OrderData) => {
    if (selectedOrder.orderNoC == order.orderNoC) {
      setSelectedOrder({})
    } else {
      setSelectedOrder(order)
    }
  };
  return (
    <div className="layout-root">
      {loading && <Loading />}
      <div className="layout-content">
        <Contents
          orderList={filterList}
          onSelectOrderHd={onSelectOrderHd}
        />
      </div>
      <div className="order-action-bar">
        <OrderActionBar
          orderCnt={orderCount}
          selectedOrderNo={selectedOrder.orderNoC}
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
          onRestoreRecent = {handleRestoreRecent}
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
        saleDt={saleDt}
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false)
          getOrderData(saleDt)
        }}
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
