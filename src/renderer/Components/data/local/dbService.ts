import { ipcRenderer } from 'electron';

export const getCmpList = async () => {
  return ipcRenderer.invoke('db:getCmpList');
};
