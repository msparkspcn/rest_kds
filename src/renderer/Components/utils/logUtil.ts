export const log = (message: string) => {
  if (window.ipc?.log) {
    console.log("로그 - "+message);
    window.ipc.log(message); // 파일로도 기록
  }
  else {
    console.log("else")
  }
};
