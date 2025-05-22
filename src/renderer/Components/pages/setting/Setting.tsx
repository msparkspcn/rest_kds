import React, { useEffect, useState } from 'react';
import * as api from "@Components/data/api/api";
import {useUserStore} from "@Components/store/user";
import { useNavigate } from "react-router-dom";
import './Setting.scss';
import DropdownMenu from '@Components/common/DropdownMenu';
import {getPlatform} from '@Components/utils/platform';
import packageJson from '../../../../../package.json';
import ConfirmDialog from '@Components/common/ConfirmDialog';

const Setting: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    // const [saleOpen, setSaleOpen] = useState<boolean>(props.route.params.saleOpen);
    // const [from, setFrom] = useState<string>(props.route.params.from);
    // const [systemTy, setSystemTy] = useState<string>('0');
    // const [appVersion, setAppVersion] = useState<string>("");
    const user = useUserStore((state) => state.user);

    const [cmpNmList, setCmpNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [selectedCmpCd, setSelectedCmpCd] = useState<string>("");
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>("");
    const [selectedStorCd, setSelectedStorCd] = useState<string>("");
    const [selectedCornerCd, setSelectedCornerCd] = useState<string>("");
    const [salesOrgNmList, setSalesOrgNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [cornerNmList, setCornerNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [cornerList, setCornerList] = useState([]);
    const navigate = useNavigate();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmProps, setConfirmProps] = useState({
      title: '',
      message: '',
      onConfirm: () => {},
    });

    const platform = getPlatform();

    useEffect(() => {
        console.log("##### 세팅화면 진입 #####")
        // 버전확인
        // setAppVersion(Constants.expoConfig.version);
        console.log("Setting user:"+JSON.stringify(user))
        if(user!=null) {
          if ("cmpCd" in user) {
            console.log("cmpCd:"+user.cmpCd)
            setSelectedCmpCd(user.cmpCd)
            getCmpList(user.cmpCd)
          }
        }
    }, []);

    const updateVersion = () => {
      console.log("업데이트 버전")
      localStorage.clear();
    };

    const getCmpList = async (cmpCd: string) => {
        const request = { "cmpValue" : cmpCd }
        try {
          const result = await api.getCmpList(request);
          const {responseCode, responseMessage, responseBody} = result.data;

          if (responseCode === "200") {
            console.log("회사 조회 성공 responseBody:"+JSON.stringify(responseBody))
            if (responseBody != null) {
              for (const cmp of responseBody) {
                const { cmpCd, cmpNm} = cmp;
                console.log("cmpCd:"+cmpCd+", cmpNm:"+cmpNm)
                if(platform==='electron') {
                  await window.ipc.cmp.add(cmpCd, cmpNm);
                } else {
                  console.log("웹입니다")
                }
              }
              setCmpNmList(
                responseBody.map(({ cmpCd, cmpNm }: { cmpCd: string; cmpNm: string }) => ({
                  infoCd: cmpCd,
                  infoNm: cmpNm,
                }))
              );
              getSalesOrgList(cmpCd)
            }
          }
          else {
            window.alert("ErrorCode :: " + responseCode + "\n" + responseMessage);
          }
        }
        catch(error) {
          window.alert("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error);
        }
    };

    const getSalesOrgList = (cmpCd: string) => {
        // setLoading(true)
        const request = {
            cmpCd : cmpCd,
            restValue : ""
        }
        api.getSalesOrgList(request).then((result) => {
            const {responseCode, responseMessage, responseBody} = result.data;
            if (responseCode === "200") {
                console.log("영업 조직 조회 성공 responseBody:"+JSON.stringify(responseBody))
              if(responseBody != null) {
                setSalesOrgNmList(
                  responseBody.map(({ salesOrgCd, salesOrgNm }: { salesOrgCd: string; salesOrgNm: string }) => ({
                    infoCd: salesOrgCd,
                    infoNm: salesOrgNm,
                  }))
                );
                if(!(user) || user.salesOrgCd == "") {
                  // getStorList(cmpCd, responseBody[0].salesOrgCd)
                  getCornerList(cmpCd,responseBody[0].salesOrgCd)
                  setSelectedSalesOrgCd(responseBody[0].salesOrgCd)
                } else {
                  // getStorList(cmpCd, user.salesOrgCd)
                  getCornerList(cmpCd,user.salesOrgCd)
                  setSelectedSalesOrgCd(user.salesOrgCd)
                }
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

                // setLoading(false)
            })
    }

    const getCornerList = async (cmpCd: string, salesOrgCd: string) => {
        // setLoading(true)
        console.log("getCornerList:")
        const request = {
            cmpCd : cmpCd,
            salesOrgCd : salesOrgCd
        }
        try {
          const result = await api.getCornerList(request);
          const {responseCode, responseMessage, responseBody} = result.data;
          if (responseCode === "200") {
            console.log("코너 조회 성공")
            if(responseBody!=null) {
              for(const corner of responseBody) {
                const { cmpCd, salesOrgCd, storCd, cornerCd, cornerNm, useYn } = corner;
                if(platform==='electron') {
                  console.log("cmpCd:"+cmpCd);
                  await window.ipc.corner.add(cmpCd, salesOrgCd, storCd, cornerCd, cornerNm, useYn);
                } else {
                  console.log("웹입니다")
                }
              }
              setCornerList(responseBody);
              setCornerNmList(
                responseBody.map(({ cornerCd, cornerNm }: { cornerCd: string; cornerNm: string }) => ({
                  infoCd: cornerCd,
                  infoNm: cornerNm
                }))
              );
              setSelectedStorCd(responseBody[0].storCd)
              setSelectedCornerCd(responseBody[0].cornerCd)
              getProductList(cmpCd, salesOrgCd, responseBody[0].storCd)
            }
          }
          else {
            window.alert("ErrorCode :: " + responseCode + "\n" + responseMessage);
          }
        }
        catch(error) {
          window.alert("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error);
        }
        finally {
          const cornerList = await window.ipc.corner.getList("1");
          console.log('코너 목록:', cornerList); // 👈 여기서 로그
            setLoading(false)
        }
    }

  const getProductList = async (cmpCd:string, salesOrgCd:string, storCd:string) => {
    console.log("상품 조회:"+cmpCd+", "+salesOrgCd+", "+storCd)
    const params = {
      cmpCd: cmpCd,
      salesOrgCd: salesOrgCd,
      storCd: storCd,
      cornerCd: 'CIHA'
    };
    try {
      const result = await api.getProductList(params);
      const { responseBody, responseCode, responseMessage } = result.data;

      if (responseCode === '200') {
        for (const product of responseBody) {
          if(getPlatform()==='electron') {
            const {cmpCd, salesOrgCd, storCd, cornerCd,
              itemCd, itemNm, price, soldoutYn, useYn} = product;
            console.log("product:"+JSON.stringify(product))
            await window.ipc.product.add(cmpCd, salesOrgCd, storCd, cornerCd, itemCd, itemNm, price, soldoutYn, useYn)
          }
        }

        console.log(`### count:${responseBody.length}`);
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
      console.log('상품 insert 완료'); // 👈 여기서 로그
      const productList = await window.ipc.product.getList(
        cmpCd, salesOrgCd, storCd, 'CIHA')
      console.log("상품 목록",JSON.stringify(productList))
    }
  }

  const onCancel = () => {
      navigate(-1);
  };

  const onSave = () => {
    console.log("정보", selectedCmpCd+","+selectedSalesOrgCd+","+selectedStorCd+","+selectedCornerCd);
    setConfirmProps({
      title:'확인',
      message:"설정 정보를 저장하시겠어요?",
      onConfirm:()=>{
      console.log("저장");
      const user = useUserStore.getState().getUser();
      if(user) {
        useUserStore.getState().setUser({
          ...user,
          cmpCd: selectedCmpCd,
          salesOrgCd: selectedSalesOrgCd,
          storCd: selectedStorCd,
          cornerCd:selectedCornerCd
        })
      }
      navigate("/main");
    }}
    );
    setConfirmOpen(true);
  };

    const changeSelectedCmpCd = (item: { infoCd: string; infoNm: string })  => {
      setSelectedCmpCd(item.infoCd);
      if(platform==='electron') {
        // updateCmp(item.infoCd, "안녕")
      }
      // 추가적인 로직이 필요하면 여기에 작성
      getSalesOrgList(item.infoCd)
    };

    const changeSelectedSalesOrgCd = (item: { infoCd: string; infoNm: string })  => {
      console.log("326 item:"+JSON.stringify(item));
      setSelectedSalesOrgCd(item.infoCd);
      getCornerList(selectedCmpCd,item.infoCd)
    }

    const changeSelectedCornerCd = (item: { infoCd: string; infoNm: string })  => {
      console.log("358 item:"+JSON.stringify(item));
      setSelectedCornerCd(item.infoCd);
      const storCd = cornerList.find(corner => corner.cornerCd === item.infoCd)?.storCd || null;
      console.log("storCd:"+storCd)
      // console.log("cornerList:"+JSON.stringify(cornerList))
      if(storCd) {
        setSelectedStorCd(storCd);
        getProductList(selectedCmpCd, selectedSalesOrgCd, storCd)
      }
    }
    const loadCmpList = async () => {
      console.log("마스터 수신")
      try {
        if(platform==='electron') {
          const cmpList = await window.ipc.cmp.getList();
          console.log('회사 목록:', cmpList); // 👈 여기서 로그
        }
        else {
          console.log("not electron")
        }
      } catch (err) {
        console.error('에러 발생:', err);
      }
    };

  if(loading) {
        return <></>
    }
    return (
      <div className="container">
        <div className="button-container">
          <button onClick={updateVersion}>
            <span>업데이트</span>
          </button>
          <button onClick={loadCmpList}>
            <span>마스터수신</span>
          </button>
        </div>
        <div className="info-section">
          <div className="info-left">
            <span className="title">기초정보</span>
            <div className="field">
              <span className="info-title">프로그램 버전</span>
              <span className="value">{packageJson.version}</span>
            </div>

            <div className="field">
              <span className="info-title">휴게소 운영업체</span>
              <DropdownMenu
                infoList={cmpNmList}
                selectedInfo={cmpNmList.find(item => item.infoCd === selectedCmpCd) ?? cmpNmList[0]}
                onSelectInfo={changeSelectedCmpCd}/>
            </div>

            <div className="field">
              <span className="info-title">휴게소</span>
              <DropdownMenu
                infoList={salesOrgNmList}
                selectedInfo={salesOrgNmList.find(item => item.infoCd === selectedSalesOrgCd) ?? salesOrgNmList[0]}
                onSelectInfo={changeSelectedSalesOrgCd} />
            </div>

            <div className="field">
              <span className="info-title">매장</span>
              <DropdownMenu
                infoList={cornerNmList}
                selectedInfo={cornerNmList.find(item => item.infoCd === selectedCornerCd) ?? cornerNmList[0]}
                onSelectInfo={changeSelectedCornerCd} />
            </div>
          </div>
        </div>
        <div className="action-buttons">
          <button className="cancel" onClick={onCancel}>로그아웃</button>
          <button className="save" onClick={onSave}>저장</button>
        </div>
        {confirmOpen && (
          <ConfirmDialog
            confirmOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            {...confirmProps}
          />
        )}
      </div>
  );
};

export default Setting;
