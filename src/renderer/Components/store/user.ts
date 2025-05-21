import {create} from "zustand";
import { persist } from 'zustand/middleware';

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
    userId: string;
    password: string;
    setUser: (user: UserData) => void;
    getUser: () => UserData | null;
    setUserId: (userId: string) => void;
    getUserId: () => string;
  setPassword: (password: string) => void;
  getPassword: () => string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      userId: '',
      password: '',
      setUser: (user) => set({ user }),
      getUser: () => get().user,
      setUserId: (userId) => set({ userId }),
      getUserId: () => get().userId,
      setPassword: (password) => set({ password }),
      getPassword: () => get().password,
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        password: state.password,
      }),
    }
  )
);
