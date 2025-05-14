export const isElectron = (): boolean => {
  return !!(window && window.process && window.process.type);
};

export const getPlatform = (): 'electron' | 'web' => {
  return isElectron() ? 'electron' : 'web';
};
