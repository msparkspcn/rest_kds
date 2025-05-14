import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { Alert } from "react-alert"; // You can use any web-compatible alert library or native JS alert
// import { AppContext } from "../../../App";
import * as api from "@Components/data/api/api";
import {useUserStore} from "@Components/store/user";
import { useNavigate } from "react-router-dom";
import './Setting.scss';
import DropdownMenu from '@Components/common/DropdownMenu';
import SegmentedControl from '@Components/common/SegmentedControl';
import {getPlatform} from '@Components/utils/platform';
// interface SettingPageProps {
//     route: {
//         params: {
//             store: Store;
//             saleOpen: boolean;
//             config: Config;
//             from: string;
//         };
//     };
//     navigation: any;
// }

const Setting: React.FC = () => {
    // const { AppFuncRestart } = useContext(AppContext);

    const [loading, setLoading] = useState<boolean>(true);
    // const [saleOpen, setSaleOpen] = useState<boolean>(props.route.params.saleOpen);
    // const [config, setConfig] = useState<Config>(props.route.params.config);
    // const [from, setFrom] = useState<string>(props.route.params.from);
    // const [systemIdx, setSystemIdx] = useState<number>(0);
    // const [systemTy, setSystemTy] = useState<string>('0');
    // const [sectionList, setSectionList] = useState<Section[]>([
    //     { sectionCd: "", sectionNm: "" }
    // ]);
    // const [section, setSection] = useState<Section>({ sectionCd: "10000", sectionNm: "TEST" });
    // const [appVersion, setAppVersion] = useState<string>("");
    const user = useUserStore((state) => state.user);
    // const setUser = useUserStore((state) => state.setUser);
    // const getUser = useUserStore((state) => state.getUser);
    // type Company = {
    //     cmpCd: string;
    //     cmpNm: string;
    // }
    const [cmpNmList, setCmpNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [selectedCmpCd, setSelectedCmpCd] = useState<string>("");
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>("");
    const [selectedStorCd, setSelectedStorCd] = useState<string>("");
    const [selectedCornerCd, setSelectedCornerCd] = useState<string>("");
    const [salesOrgNmList, setSalesOrgNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [storNmList, setStorNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [cornerNmList, setCornerNmList] = useState<{infoCd: string, infoNm: string}[]>([]);
    const [sectionList, setSectionList] = useState([
      {sectionCd: "", sectionNm: ""}
    ]);
    const navigate = useNavigate();

    const [mode, setMode] = useState("EXPO");

    const segmentData = [
        { label: "EXPO", value: "EXPO" },
        { label: "SECTION", value: "SECTION" }
    ];
    const controlRef = useRef<HTMLDivElement | null>(null);
    const segmentRefs = segmentData.map(() => useRef<HTMLDivElement | null>(null));
    const platform = getPlatform();
    useEffect(() => {
        console.log("##### 세팅화면 진입 #####")
        // 버전확인
        // setAppVersion(Constants.expoConfig.version);
        console.log("Setting user:"+JSON.stringify(user))
        if(user!=null) {
          if ("cmpCd" in user) {
            console.log("cmpCd:"+user.cmpCd)
            getCmpList(user.cmpCd)
            setSelectedCmpCd(user.cmpCd)
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

        // const sectionFromStorage = localStorage.getItem("KDS_SECTION_CD");
        // if (sectionFromStorage !== null) {
        //     setSection(JSON.parse(sectionFromStorage));
        // }
    }, []);

    const init = () => {
      localStorage.clear();
      deleteCmp('SLKR')
    };

    const getCmpList = async (cmpCd: String) => {
        const request = {
            "cmpValue" : cmpCd
        }
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
        setLoading(true)
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
                  getStorList(cmpCd, responseBody[0].salesOrgCd)
                  setSelectedSalesOrgCd(responseBody[0].salesOrgCd)
                } else {
                  getStorList(cmpCd, user.salesOrgCd)
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

    const getCornerList = (cmpCd: String, salesOrgCd: String, storCd: String) => {
        // setLoading(true)
        console.log("storCd:"+storCd)
        const request = {
            cmpCd : cmpCd,
            salesOrgCd : salesOrgCd,
            storeValue : ""
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
                setSelectedStorCd(responseBody[0].cornerCd)
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
            setSectionList(responseBody);
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
    //
    // const renderItem = ({ item }: { item: Section }) => {
    //     return (
    //         <button
    //             className={`p-2 rounded ${item.sectionCd === section.sectionCd ? 'bg-primary' : ''}`}
    //             onClick={() => onSelectedSection(item)}
    //         >
    //             <span className="text-white font-bold">{item.sectionNm}</span>
    //         </button>
    //     );
    // };

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
        alert('설정 정보를 저장하시겠어요? 저장 후 앱이 재실행 됩니다.');
        // localStorage.setItem("KDS_SYSTEM_TY", systemIdx + "");
        // localStorage.setItem("KDS_SECTION_CD", JSON.stringify(section));
        navigate("/main")
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
      getStorList(selectedCmpCd,item.infoCd)
    }

    const changeSelectedStorCd = (item: { infoCd: string; infoNm: string })  => {
      console.log("358 item:"+JSON.stringify(item));
      setSelectedStorCd(item.infoCd);
      getCornerList(selectedCmpCd, selectedSalesOrgCd, item.infoCd);
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
    const memoizedSegmentData = useMemo(() =>
      segmentData.map((seg, i) => ({
        ...seg,
        ref: segmentRefs[i],
      })), [segmentData, segmentRefs]);

    const handleChangeMode = useCallback((newMode: string) => {
      setMode(newMode);
    }, []);

  const defaultIndex = useMemo(() =>
    segmentData.findIndex(seg => seg.value === mode), [segmentData, mode]);

  if(loading) {
        return <></>
    }
    return (
      <div className="container">
        <div className="spacer-70" />

        <div className="button-container">
          <div className="empty-space" />
          <button onClick={init}>
            <span>초기화</span>
          </button>
          <button onClick={loadCmpList}>
            <span>마스터수신</span>
          </button>
        </div>

        <div className="spacer-20" />

        <div className="info-section">
          <div className="info-left">
            <span className="title">기초정보</span>

            <div className="field">
              <span>프로그램 버전</span>
              {/* <span className="value">{appVersion}</span> */}
            </div>

            <div className="field">
              <span>회사</span>
              <DropdownMenu
                infoList={cmpNmList}
                selectedInfo={cmpNmList.find(item => item.infoCd === selectedCmpCd) ?? cmpNmList[0]}
                onSelectInfo={changeSelectedCmpCd}/>
            </div>

            <div className="field">
              <span>영업조직</span>
              <DropdownMenu
                infoList={salesOrgNmList}
                selectedInfo={salesOrgNmList.find(item => item.infoCd === selectedSalesOrgCd) ?? salesOrgNmList[0]}
                onSelectInfo={changeSelectedSalesOrgCd} />
            </div>

            <div className="field">
              <span>점포</span>
              <DropdownMenu
                infoList={storNmList}
                selectedInfo={storNmList.find(item => item.infoCd === selectedStorCd) ?? storNmList[0]}
                onSelectInfo={changeSelectedStorCd} />
            </div>

            <div className="field">
              <span>코너</span>
              <DropdownMenu
                infoList={cornerNmList}
                selectedInfo={cornerNmList.find(item => item.infoCd === selectedCornerCd) ?? cornerNmList[0]}
                onSelectInfo={changeSelectedCornerCd} />
            </div>
          </div>

          <div className="info-right">
            <span className="title">설정정보</span>

            <SegmentedControl
              name="group-1"
              segments={memoizedSegmentData}
              callback={handleChangeMode}
              controlRef={controlRef}
              defaultIndex={defaultIndex}
            />


            <div className="field">
              <span className="label">시스템구분</span>
              <div>
                <span className="label">{mode}</span>
                {mode==='SECTION' &&
                <div className="section-list">
                  {sectionList.map((section, index) => (
                    <RenderItem key={index} item={section} index={index} />
                  ))}
                  </div>
                }


              </div>

            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="cancel" onClick={onCancel}>
            취소
          </button>
          <button className="save" onClick={onSave}>
            저장
          </button>
        </div>
      </div>
  );
};

interface SectionItem {
  sectionCd: string;
  sectionNm: string;
}

interface RenderItemProps {
  item: SectionItem;
  index: number;
}
function RenderItem({ item, index }: RenderItemProps): JSX.Element {
  return (
    <div className="section-item">{item.sectionNm}</div>
  );
}

export default Setting;
