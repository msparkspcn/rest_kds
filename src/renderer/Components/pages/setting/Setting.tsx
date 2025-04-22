import React, {useEffect, useRef, useState} from "react";
// import { Alert } from "react-alert"; // You can use any web-compatible alert library or native JS alert
// import { AppContext } from "../../../App";
import * as api from "@Components/api/api";
import {useUserStore} from "@Components/store/user";
import { useNavigate } from "react-router-dom";
import './Setting.scss';
import DropdownMenu from '@Components/common/DropdownMenu';
import SegmentedControl from '@Components/common/SegmentedControl';
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
    const navigate = useNavigate();

    const [mode, setMode] = useState("EXPO");

    const segmentData = [
        { label: "EXPO", value: "EXPO" },
        { label: "SECTION", value: "SECTION" }
    ];
    const controlRef = useRef<HTMLDivElement | null>(null);
    const segmentRefs = segmentData.map(() => useRef<HTMLDivElement | null>(null));

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
            }
        }

        // const sectionFromStorage = localStorage.getItem("KDS_SECTION_CD");
        // if (sectionFromStorage !== null) {
        //     setSection(JSON.parse(sectionFromStorage));
        // }
    }, []);

    const init = () => {
        localStorage.clear();
    };

    const getCmpList = (cmpCd: String) => {
        const request = {
            "cmpValue" : cmpCd
        }
        api.getCmpList(request).then((result) => {
            const {responseCode, responseMessage, responseBody} = result.data;
            if (responseCode === "200") {
                console.log("회사 조회 성공 responseBody:"+JSON.stringify(responseBody))
              if (responseBody != null) {
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
        })
            .catch(ex => {
                window.alert("서버에 문제가 있습니다.\n관리자에게 문의해주세요.\n(" + ex.message + ")");
            })
            .finally(() => {
                // setLoading(false)
            })
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

    // const getKdsMstSection = (store: Store) => {
    //     const params = {
    //         cmpCd: store.cmpCd,
    //         brandCd: store.brandCd,
    //         storeCd: store.storeCd,
    //         systemTy: "1",
    //         useYn: "Y",
    //     };
    //
    //     // Replace the api call with a browser-friendly fetch or axios call
    //     // fetch("/api/getKdsMstSection", { method: "POST", body: JSON.stringify(params) })
    //     //     .then(res => res.json())
    //     //     .then(result => {
    //     //         const { responseCode, responseMessage, responseBody } = result;
    //     //         if (responseCode === "200") {
    //     //             setSectionList(responseBody);
    //     //         } else {
    //     //             alert(responseMessage);
    //     //         }
    //     //     })
    //     //     .catch(ex => {
    //     //         alert(ex.message);
    //     //     })
    //     //     .finally(() => {
    //     //         setLoading(false);
    //     //     });
    // };
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

    const onSelectInfo = () => {

    }

    const changeSelectedCmpCd = (item: { infoCd: string; infoNm: string })  => {
      setSelectedCmpCd(item.infoCd);
      // 추가적인 로직이 필요하면 여기에 작성
    };

    const changeSelectedSalesOrgCd = (item: { infoCd: string; infoNm: string })  => {
      console.log("326 item:"+JSON.stringify(item));
      setSelectedSalesOrgCd(item.infoCd);
    }
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
          <button>
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
              <DropdownMenu infoList={cmpNmList} onSelectInfo={changeSelectedCmpCd}/>
            </div>

            <div className="field">
              <span>영업조직</span>
              <DropdownMenu infoList={salesOrgNmList} onSelectInfo={changeSelectedSalesOrgCd} />
            </div>

            <div className="field">
              <span>점포</span>
              <DropdownMenu infoList={storNmList} onSelectInfo={changeSelectedCmpCd} />
            </div>

            <div className="field">
              <span>코너</span>
              <DropdownMenu infoList={cornerNmList} onSelectInfo={changeSelectedCmpCd} />
            </div>
          </div>

          <div className="info-right">
            <span className="title">설정정보</span>

            <SegmentedControl
              name="group-1"
              segments={segmentData.map((seg, i) => ({
                ...seg,
                ref: segmentRefs[i],
              }))}
              callback={setMode}
              controlRef={controlRef}
              defaultIndex={segmentData.findIndex(
                (seg) => seg.value === mode
              )}
            />
            {/*<p className="selected-item">Selected: {mode}</p>*/}

            <div className="field">
              <span className="label">시스템구분</span>
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

export default Setting;
