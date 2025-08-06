import React, { useEffect, useState } from 'react';
import * as api from '@Components/data/api/api';
import { useUserStore } from '@Components/store/user';
import { useNavigate } from 'react-router-dom';
import './Setting.scss';
import DropdownMenu from '@Components/common/DropdownMenu';
import { getPlatform } from '@Components/utils/platform';
import ConfirmDialog from '@Components/common/ConfirmDialog';
import packageJson from '../../../../../package.json';
import { log } from '@Components/utils/logUtil';
import Alert from '@Components/common/Alert';
import Loading from '@Components/common/Loading';
import { STRINGS } from '../../../constants/strings';

type Corner = {
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  cornerCd: string;
  cornerNm: string;
  useYn: string;
}

const Setting: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
    // const [saleOpen, setSaleOpen] = useState<boolean>(props.route.params.saleOpen);
    // const [appVersion, setAppVersion] = useState<string>("");
  const user = useUserStore((state) => state.user);

  const [cmpNmList, setCmpNmList] = useState<{ infoCd: string; infoNm: string }[] | null>(null);
  const [salesOrgNmList, setSalesOrgNmList] = useState<{ infoCd: string; infoNm: string }[] | null>(null);
  const [cornerNmList, setCornerNmList] = useState<{ infoCd: string; infoNm: string }[] | null>(null);

  const [selectedCmpCd, setSelectedCmpCd] = useState<string>('');
  const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
  const [selectedStorCd, setSelectedStorCd] = useState<string>(''); //사용자가 선택X
  const [selectedCornerCd, setSelectedCornerCd] = useState<string>('');
  const [cornerList, setCornerList] = useState<Corner[]>([]);
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const platform = getPlatform();
  const [errorDialog, setErrorDialog] = useState<{
    message: string;
    onRetry?: () => void;
  } | null>(null);

    useEffect(() => {
        log("세팅화면 진입")
        // 버전확인
        // setAppVersion(Constants.expoConfig.version);
        if(user!=null) {
          if ("cmpCd" in user) {
            log("cmpCd:"+user.cmpCd)
            getCmpList(user.cmpCd)
          }
        }
    }, []);

  const updateVersion = async () => {
    const version = await window.ipc.getAppVersion();
    log('앱 현재 버전:'+version);

    setConfirmProps({
      title: '업데이트',
      message: STRINGS.download_msg,
      onConfirm: async () => {
        try {
          const result = await window.ipc.checkForUpdates();
          if (result.updateAvailable) {
            const downloadResult = await window.ipc.downloadUpdate();
            if (downloadResult.success) {
              setConfirmProps({
                title: '다운로드 완료',
                message: STRINGS.install_msg,
                onConfirm: async () => {
                  await window.ipc.quitAndInstall();
                },
              });
              setConfirmOpen(true);
            } else {
              console.error('업데이트 오류:',downloadResult.error);
              showSimpleError('업데이트 다운로드에 실패했습니다.');
            }
          } else {
            showSimpleError('최신 버전입니다.');
          }
        } catch (error) {
          console.error('업데이트 오류:', error);
          showSimpleError('업데이트 중 오류가 발생했습니다.');
        }
      },
    });
    setConfirmOpen(true);
  };

  const initCmpNmList = async (list: any[]) => {
    log(`휴게소 운영업체 수:${list.length}`);
    setCmpNmList(
      list.map(({ cmpCd, cmpNm }) => ({
        infoCd: cmpCd,
        infoNm: cmpNm,
      }))
    );
    setSelectedCmpCd(user!.cmpCd)
    await getSalesOrgList(list[0].cmpCd);
  }

  const getCmpList = async (cmpCd: string) => {
    setLoading(true)
    const request = { cmpValue: cmpCd };
    try {
      const result = await api.getCmpList(request);
      const { responseCode, responseMessage, responseBody } = result.data;

      if (responseCode === "200") {
        if (responseBody != null) {
          log("휴게소 운영업체 조회 성공")
          for (const cmp of responseBody) {
            const { cmpCd, cmpNm} = cmp;
            console.log("cmpCd:"+cmpCd+", cmpNm:"+cmpNm)
            if(platform==='electron') {
              await window.ipc.cmp.add(cmpCd, cmpNm);
            } else {
              log("웹 환경입니다.")
            }
          }
          await initCmpNmList(responseBody);
        }
      }
      else {
        log("휴게소 운영업체 api 조회 실패. local db 조회")
        const localCmpList = await window.ipc.cmp.getList(cmpCd);

        if(localCmpList && localCmpList.length > 0) {
          log("local db 조회 성공 localCmpList:"+JSON.stringify(localCmpList))
          await initCmpNmList(localCmpList)
        }
        else {
          showError("휴게소 운영업체 조회에 실패했습니다.\n관리자에게 문의해주세요.", () => getCmpList(cmpCd))
          setLoading(false);
        }
      }
    }
    catch(error) {
      setLoading(false);
      showError("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error,() => getCmpList(cmpCd));
    }
  };

  const initSalesOrgNmList = async (cmpCd: string, list: any[]) => {
    log(`휴게소 수:${list.length}`);
    setSalesOrgNmList(
      list.map(({ salesOrgCd, salesOrgNm }) => ({
        infoCd: salesOrgCd,
        infoNm: salesOrgNm,
      }))
    );
    const selectedCd = user?.salesOrgCd || list[0].salesOrgCd;
    setSelectedSalesOrgCd(selectedCd);
    await getCornerList(cmpCd, selectedCd);
  };

  const getSalesOrgList = async (cmpCd: string) => {
    const request = {
        cmpCd : cmpCd,
        restValue : ""
    }
    try {
      const result = await api.getSalesOrgList(request);
      const { responseCode, responseMessage, responseBody } = result.data;
      if (responseCode === "200") {
        if(responseBody != null) {
          log("휴게소 조회 성공")
          for (const salesorg of responseBody) {
            const { cmpCd, salesOrgCd, salesOrgNm} = salesorg;
            console.log("cmpCd:"+cmpCd+", salesOrgCd:"+salesOrgCd)
            if(platform==='electron') {
              await window.ipc.salesorg.add(cmpCd, salesOrgCd, salesOrgNm);
            } else {
              log("웹 환경입니다.")
            }
          }
        await initSalesOrgNmList(cmpCd, responseBody);
        }
      }
      else {
        log("휴게소 api 조회 실패. local db 조회")
        const localSalesorgList = await window.ipc.salesorg.getList(cmpCd);
        log("local db 조회 결과:"+JSON.stringify(localSalesorgList))
        if(localSalesorgList && localSalesorgList.length > 0) {
          await initSalesOrgNmList(cmpCd, localSalesorgList);
        }
        else {
          showError("휴게소 조회에 실패했습니다.\n관리자에게 문의해주세요.", () => getSalesOrgList(cmpCd))
          setLoading(false);
        }
      }
    }
    catch(error) {
      setLoading(false);
      showError("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error, () => getSalesOrgList(cmpCd));
    }
  }

  const initCornerNmList = (list: any[]) => {
    log(`매장 수:${list.length}`);
    setCornerList(list);
    setCornerNmList(
      list.map(({ cornerCd, cornerNm }) => ({
        infoCd: cornerCd,
        infoNm: cornerNm,
      }))
    );
    const cornerCd = user?.cornerCd || list[0].cornerCd;
    const storCd = user?.storCd || list[0].storCd;
    setSelectedCornerCd(cornerCd);
    setSelectedStorCd(storCd);
    setLoading(false);
  }

  const getCornerList = async (cmpCd: string, salesOrgCd: string) => {
    log("매장 조회")
    const request = {
        cmpCd : cmpCd,
        salesOrgCd : salesOrgCd
    }
    try {
      const result = await api.getCornerList(request);
      const {responseCode, responseMessage, responseBody} = result.data;
      if (responseCode === "200") {
        if(responseBody!=null) {
          log("매장 조회 성공")
          for(const corner of responseBody) {
            const { cmpCd, salesOrgCd, storCd, cornerCd, cornerNm, useYn } = corner;
            if(platform==='electron') {
              // console.log("cmpCd:"+cmpCd);
              await window.ipc.corner.add(cmpCd, salesOrgCd, storCd, cornerCd, cornerNm, useYn);
            } else {
              log("웹 환경입니다.")
            }
          }
          initCornerNmList(responseBody)
        }
      }
      else {
        log("코너 api 조회 실패. local db 조회")
        const localCornerList = await window.ipc.corner.getList(cmpCd, salesOrgCd);
        log("local db 조회 결과1:"+JSON.stringify(localCornerList))
        if(localCornerList && localCornerList.length > 0) {
          initCornerNmList(localCornerList);
        }
        else {
          log("here")
          setLoading(false);
          showError("매장 조회에 실패했습니다.\n관리자에게 문의해주세요.", () => getCornerList(cmpCd, salesOrgCd))
        }
      }
    }
    catch(error) {
      setLoading(false);
      showError("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n error:"+error, () => getCornerList(cmpCd, salesOrgCd))
    }
  }

  const onCancel = () => {
    setConfirmProps({
      title:'확인',
      message:"로그아웃 하시겠습니까?",
      onConfirm:()=>{
        log("확인 버튼 클릭");
        navigate('/', {
          replace: true,
          state: { fromSettings: true}
        })
      }}
    );
    setConfirmOpen(true);
  };

  const onSave = () => {
    log("저장 버튼 클릭 "+selectedCmpCd+","+selectedSalesOrgCd+","+selectedStorCd+","+selectedCornerCd);
    setConfirmProps({
      title:'확인',
      message:STRINGS.save_setting_msg,
      onConfirm:()=>{
        log("확인 버튼 클릭");
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

  const changeSelectedCmpCd = (item: { infoCd: string; infoNm: string }) => {
    setSelectedCmpCd(item.infoCd);
    if (platform === 'electron') {
      // updateCmp(item.infoCd, "안녕")
    }
    // 추가적인 로직이 필요하면 여기에 작성
    getSalesOrgList(item.infoCd);
  };

  const changeSelectedSalesOrgCd = (item: { infoCd: string; infoNm: string }) => {
    console.log(`326 item:${JSON.stringify(item)}`);
    setSelectedSalesOrgCd(item.infoCd);
    getCornerList(selectedCmpCd, item.infoCd);
  };

  const changeSelectedCornerCd = (item: { infoCd: string; infoNm: string }) => {
    console.log(`358 item:${JSON.stringify(item)}`);
    setSelectedCornerCd(item.infoCd);
    const storCd = cornerList.find((corner) => corner.cornerCd === item.infoCd)?.storCd || null;
    console.log(`storCd:${storCd}`);
    // console.log("cornerList:"+JSON.stringify(cornerList))
    if (storCd) {
      setSelectedStorCd(storCd);
      setLoading(false);
    }
  };

  const showError = (message: string, onRetry: () => void) => {
    setErrorDialog({ message, onRetry });
  };

  const showSimpleError = (message: string) => {
    setErrorDialog({ message }); // retry 없이
  };

  if(errorDialog) {
    return (
      <Alert
      title="알림"
      message={errorDialog.message}
      onClose={() => {
        const retry = errorDialog.onRetry;
        setErrorDialog(null);
        if (retry) retry();
      }}
    />
    )
  }
  if (loading || cmpNmList === null || salesOrgNmList === null || cornerNmList === null) {
    return <Loading />;
  }
  else {
    return (
      <div className="container">
        <div className="button-container">
          <button className="update" onClick={updateVersion}>업데이트</button>
          <button className="master" onClick={() => getCmpList(user!.cmpCd)}>마스터수신</button>
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
  }
};

export default Setting;
