export const getCmpList = async (cmpCd: string) => {
  return window.ipc.cmp.getList(cmpCd);
};
