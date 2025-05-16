import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from "@Components/data/api/api";
import {useUserStore} from "@Components/store/user";
import { useNavigate } from "react-router-dom";
import './Setting.scss';
import DropdownMenu from '@Components/common/DropdownMenu';
import {getPlatform} from '@Components/utils/platform';
import packageJson from '../../../../../package.json';
import ConfirmDialog from '@Components/common/ConfirmDialog';
import { STRINGS } from '../../../constants/strings';
import Alert from '@Components/common/Alert';
import { useConfigStore } from '@Components/store/config';

const Setting: React.FC = () => {
    // const { AppFuncRestart } = useContext(AppContext);

    const [loading, setLoading] = useState<boolean>(true);
    // const [saleOpen, setSaleOpen] = useState<boolean>(props.route.params.saleOpen);
    // const [from, setFrom] = useState<string>(props.route.params.from);
    // const [systemIdx, setSystemIdx] = useState<number>(0);
    // const [systemTy, setSystemTy] = useState<string>('0');
    // const [sectionList, setSectionList] = useState<Section[]>([
    //     { sectionCd: "", sectionNm: "" }
    // ]);
    // const [section, setSection] = useState<Section>({ sectionCd: "10000", sectionNm: "TEST" });
    // const [appVersion, setAppVersion] = useState<string>("");
    const user = useUserStore((state) => state.user);

    const [cmpNmList, setCmpNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [selectedCmpCd, setSelectedCmpCd] = useState<string>("");
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>("");
    const [selectedCornerCd, setSelectedCornerCd] = useState<string>("");
    const [salesOrgNmList, setSalesOrgNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [cornerNmList, setCornerNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const navigate = useNavigate();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmProps, setConfirmProps] = useState({
      title: '',
      message: '',
      onConfirm: () => {},
    });
    const [alertOpen, setAlertOpen] = useState(false);

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

        const systemTyFromStorage = localStorage.getItem("KDS_SYSTEM_TY");
        if (systemTyFromStorage !== null) {
            // setSystemIdx(parseInt(systemTyFromStorage));
            if (systemTyFromStorage === '1') {
                // getKdsMstSection(store);
                getKdsMstSection();
            }
        }

    }, []);

    const init = () => {
      localStorage.clear();

      deleteCmp('SLKR')
    };

    const getCmpList = async (cmpCd: String) => {
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

    const getSalesOrgList = (cmpCd: String) => {
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
  /*
    const getStorList = (cmpCd: String, salesOrgCd: String) => {
      console.log("cmpCd:"+cmpCd+", salesOrgCd:"+salesOrgCd)
        // setLoading(true)
        const request = {
            cmpCd : cmpCd,
            salesOrgCd : salesOrgCd,
            storeValue : ""
        }
        api.getStorList(request).then((result) => {
            const {responseCode, responseMessage, responseBody} = result.data;
            if (responseCode === "200") {
                console.log("점포 조회 성공 responseBody:"+JSON.stringify(responseBody))
              if(responseBody != null) {
                setStorNmList(
                  responseBody.map(({ storCd, storNm }: { storCd: string; storNm: string }) => ({
                    infoCd: storCd,
                    infoNm: storNm,
                  }))
                );
                console.log("1.storCd:"+user.storCd)
                if (!(user) || user.storCd == "") {
                  getCornerList(cmpCd, salesOrgCd, responseBody[0].storCd)
                  setSelectedStorCd(responseBody[0].storCd)
                } else {
                  if (user.storCd) {
                    getCornerList(cmpCd, salesOrgCd, user.storCd)
                    setSelectedStorCd(user.storCd)
                  }

                }
              }
                // getSalesOrgList(cmpCd)
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
*/
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
                setCornerNmList(
                  responseBody.map(({ cornerCd, cornerNm }: { cornerCd: string; cornerNm: string }) => ({
                    infoCd: cornerCd,
                    infoNm: cornerNm,
                  }))
                );
                getKdsMstSection();
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
                setLoading(false)
            })
    }

    const getKdsMstSection = () => {
        const params = {
            cmpCd: '90000001',
            brandCd: '9999',
            storeCd: '000281',
            systemTy: "1",
            useYn: "Y",
        }
        api.getKdsMstSection(params).then(result => {
          const {responseCode, responseMessage, responseBody} = result.data;
          if (responseCode === "200") {
            console.log("kdsMstSection:"+responseBody)
          }
          else {
            // Alert.alert("!", responseMessage);
          }
        })
          .catch(ex => {
            // Alert.alert("!", ex.message);
          })
          .finally(() => {
            setLoading(false);
          })
        // Replace the api call with a browser-friendly fetch or axios call
        // fetch("/api/getKdsMstSection", { method: "POST", body: JSON.stringify(params) })
        //     .then(res => res.json())
        //     .then(result => {
        //         const { responseCode, responseMessage, responseBody } = result;
        //         if (responseCode === "200") {
        //             setSectionList(responseBody);
        //         } else {
        //             alert(responseMessage);
        //         }
        //     })
        //     .catch(ex => {
        //         alert(ex.message);
        //     })
        //     .finally(() => {
        //         setLoading(false);
        //     });
    };


    // const onSelectedSystemTy = (event: any) => {
    //     setSystemIdx(event.selectedIndex);
    //     if (event.selectedIndex !== 0) {
    //         getKdsMstSection(store);
    //     }
    // };

    // const onSelectedSection = (item: Section) => {
    //     setSection(item);
    // };

    const onCancel = () => {
        // console.log("### from :: ", from);
        // if (from === "main") {
        //     props.navigation.navigate("Main", {
        //         store: store,
        //         saleOpen: saleOpen,
        //         config: config,
        //     });
        // } else {
        //     props.navigation.navigate("Login", {
        //         store: store,
        //         saleOpen: saleOpen,
        //         config: config,
        //     });
        //     navigate()
        // }
        navigate(-1);
    };

    const onSave = () => {
      setConfirmProps({
        title:'확인',
        message:"설정 정보를 저장하시겠어요?\n저장 후 앱이 재실행 됩니다.",
        onConfirm:()=>{
        console.log("저장");
        navigate("/main");
      }}
      );
      setConfirmOpen(true);
        // localStorage.setItem("KDS_SYSTEM_TY", systemIdx + "");
        // localStorage.setItem("KDS_SECTION_CD", JSON.stringify(section));

        // AppFuncRestart();
    };

    const changeSelectedCmpCd = (item: { infoCd: string; infoNm: string })  => {
      setSelectedCmpCd(item.infoCd);
      if(platform==='electron') {
        updateCmp(item.infoCd, "안녕")
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
      getKdsMstSection();
    }
    const loadCmpList = async () => {
      try {
        if(platform==='electron') {
          const cmpList = await window.ipc.cmp.getList();
          console.log('회사 목록:', cmpList); // 👈 여기서 로그
        }
      } catch (err) {
        console.error('에러 발생:', err);
      }
    };

    const deleteCmp = async (cmpCd:string) => {
      try {
        const result = await window.ipc.cmp.delete(cmpCd);
        console.log('삭제 결과:'+result)
      } catch(err) {
        console.error('에러 발생:', err);
      }
    }

    const updateCmp = async (cmpCd:string, cmpNm:string) => {
      try {
        const result = await window.ipc.cmp.update(cmpNm, cmpCd);
        console.log('업데이트 결과:'+result)
      } catch(err) {
        console.error('에러 발생:', err);
      }
    }

  if(loading) {
        return <></>
    }
    return (
      <div className="container">
        <div className="button-container">
          <div className="empty-space" />
          <button onClick={init}>
            <span>초기화</span>
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
        {alertOpen && (
          <Alert
            title="알림"
            message="섹션을 선택해주세요."
            onClose={()=>{setAlertOpen(false)}}
          />
        )}

      </div>
  );
};

export default Setting;
