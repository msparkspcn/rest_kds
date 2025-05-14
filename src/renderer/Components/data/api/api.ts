import axios, { AxiosRequestConfig } from 'axios';

// export const host = process.env.REACT_APP_API_URL;
export const host = "https://s9rest.ngrok.io";
// export const host = 'https://o2api.spc.co.kr';
const api = axios.create({ baseURL: host });

let authToken: string | null = null;
api.interceptors.request.use((config) => {
    if (authToken) {
        // console.log("Using authToken:", authToken);
        config.headers["Authorization"] = authToken;
    }
    return config;
});

export function getOrderDataList(params: any) {
  // const request = `${host}/api/v1/order/getOrderDataList`;
  const request = `https://o2api.spc.co.kr/api/v1/order/getOrderDataList`;
  return post(request, params);
}

export function getKdsMstSection(params: any) {
  const request = `https://o2api.spc.co.kr/api/v1/kds/mst/list`;
  return post(request, params);
}

export function getKdsMstSectionItemList(params: any) {
  const request = `https://o2api.spc.co.kr/api/v1/kds/section/items`;
  return post(request, params);
}

export function post(request: string, body: any) {
  return api.post(request, body);
}

export function postQueryString(request: string, config: AxiosRequestConfig) {
  return axios.post(request, null, config);
}

export function get(request: string, body: any) {
  return axios.get(request, {
    params: body,
  });
}

export function put(request: string, body: any) {
  return axios.put(request, body);
}

// export function patch(request: string, body: any) {
//     return axios.patch(request, body);
// }

export function deleteM(request: string, body: any) {
  return axios.delete(request, { data: body });
}

export function setAuthToken(token: string) {
    console.log("Set Token:", token);
    authToken = token;
}

export function login(params: any) {
  const request = `${host}/api/v1/login/`;
  return post(request, params);
}

export function getCmpList(params: any) {
  const request = `${host}/api/v1/company/list`;
  return post(request, params);
}

export function getSalesOrgList(params: any) {
  const request = `${host}/api/v1/rest/list`;
  return post(request, params);
}

export function getStorList(params: any) {
  const request = `${host}/api/v1/store/list`;
  return post(request, params);
}

export function getCornerList(params: any) {
  const request = `${host}/api/v1/corner/list`;
  return post(request, params);
}

export function updateOrderCallState(params: any) {
  const request = `${host}/api/v1/kds/hd/call/state`;
  return post(request, params);
}

// export function getOrderDataList(params) {      //주문 조회(가칭)
//     const request = host + "/order/getOrderDataList";
//     return post(request, params);
// }
//
// export function getSaleOpen(params: any) {      //개점 조회(가칭)
//     const request = host + "/saleOpen/getSaleOpen";
//     return post(request, params);
// }
export function getStoreSaleOpen(params:any) {
  const request = 'https://o2api.spc.co.kr/api/v1/store/getStoreSaleOpen?' + new URLSearchParams(params).toString();
  return post(request,params);
}
//
// export function getKdsMstSection(params) {      //kds 섹션 마스터 목록 조회
//     const request = host + "/kds/mst/list";
//     return post(request, params);
// }
//
// export function getKdsMstSectionItemList(params) {  //kds 섹션 상품 목록 조회
//     const request = host + "/kds/section/items";
//     return post(request, params);
// }
//
// export function updateOrderHdKdsState(params) {     //hd kdstState 업데이트
//     const request = host + "/kds/hd/state";
//     return post(request, params);
// }
//
// export function updateOrderDtKdsState(params) {     //dt kdstState 업데이트
//     const request = host + "/kds/dt/state";
//     return post(request, params);
// }
