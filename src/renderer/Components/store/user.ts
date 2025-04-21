import {create} from "zustand";

interface UserData {
    cmpCd: string;
    cmpNm: string | null;
    salesOrgCd: string;
    salesOrgNm: string | null;
    storCd: string | null;
    storNm: string | null;
    userId: string;
    userRoleType: string;
    langSettng: string;
    userNm: string;
    empNo: string | null;
    useYn: string;
    regDate: string;
    regUserId: string | null;
    updDate: string;
    updUserId: string | null;
    apiKey: string;
    apiKeyExpireDate: string | null;
}

interface UserStore {
    user: UserData | null;
    password: string | null;
    setUser: (user: UserData) => void;
    getUser: () => UserData | null;
  setPassword: (password: string) => void;
  getPassword: () => string | null;
}

export const useUserStore = create<UserStore>(
  (set, get) => ({
    user: null,
    password: null,
    setUser: (user) => set({ user }),
    getUser: () => get().user,
    setPassword: (password) => set({ password }),
    getPassword: () => get().password,
}));
