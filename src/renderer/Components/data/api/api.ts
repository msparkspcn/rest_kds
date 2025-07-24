import axios, { AxiosRequestConfig } from 'axios';

// export const host = process.env.REACT_APP_API_URL;
export const host = 'https://s9rest.ngrok.io';
// export const host = 'https://o2api.spc.co.kr';
const api = axios.create({ baseURL: host });

let authToken: string | null = null;
api.interceptors.request.use((config) => {
  if (authToken) {
    // console.log("Using authToken:", authToken);
    config.headers.Authorization = authToken;
  }
  return config;
});

export function post(request: string, body: any) {
  return api.post(request, body);
}

export function get(request: string, body: any) {
  return axios.get(request, {
    params: body,
  });
}

export function put(request: string, body: any) {
  return axios.put(request, body);
}

export function deleteM(request: string, body: any) {
  return axios.delete(request, { data: body });
}

export function setAuthToken(token: string) {
  console.log('Set Token:', token);
  authToken = token;
}

export function login(params: any) {
  const request = `/api/v1/login/`;
  return post(request, params);
}

export function getCmpList(params: any) {
  const request = `/api/v1/company/list`;
  return post(request, params);
}

export function getSalesOrgList(params: any) {
  const request = `/api/v1/rest/list`;
  return post(request, params);
}

export function getStorList(params: any) {
  const request = `/api/v1/store/list`;
  return post(request, params);
}

export function getCornerList(params: any) {
  const request = `/api/v1/corner/list`;
  return post(request, params);
}

export function getProductList(params: any) {
  const request = `/api/v1/did/item`;
  return post(request, params);
}

export function updateOrderStatus(params: any) {
  const request = `/api/v1/order/corner/update`;
  return post(request, params);
}

export function updateAllOrderStatus(params: any) {
  const request = `/api/v1/order/corner/update-all`;
  return post(request, params);
}

export function updateSoldout(params: any) {
  const request = `/api/v1/item/soldout`;
  return post(request, params);
}

export function getOpenDate(params: any) {
  const request = `/api/v1/store/open-date`;
  return post(request, params);
}

export function getOrderList(params: any) {
  const request = `/api/v1/order/corner/kds/list`;
  return post(request, params);
}
