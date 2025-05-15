import { create } from 'zustand';

interface ConfigData {
  systemType: number;
  sectionCd: string;
  sectionNm: string;
}

interface ConfigStore {
  config: ConfigData | null;
  setConfig: (config: ConfigData) => void;
  getConfig: () => ConfigData | null;
}

export const useConfigStore = create<ConfigStore>(
  (set, get) => ({
    config: null,
    setConfig: (config) => set({ config }),
    getConfig: () => get().config
  }));

