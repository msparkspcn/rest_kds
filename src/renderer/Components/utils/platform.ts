export const isElectron = (): boolean => {
  return !!(window && window.ipc && window.ipc.isElectron);
};

export const getPlatform = (): 'electron' | 'web' => {
  return isElectron() ? 'electron' : 'web';
};
