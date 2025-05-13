import { ipcRenderer } from 'electron';

export const getCmpList = async () => {
  return await ipcRenderer.invoke('db:getCmpList');
};

export const addCmp = async (cmp_cd: string, cmp_nm: string) => {
  await ipcRenderer.invoke('db:addCmp', cmp_cd, cmp_nm);
};

export const updateCmp = async (cmp_nm: string, cmp_cd: string) => {
  await ipcRenderer.invoke('db:updateCmp', cmp_nm, cmp_cd);
};

export const deleteCmp = async (cmp_cd: string) => {
  await ipcRenderer.invoke('db:deleteCmp', cmp_cd);
};
