// types/electron-progressbar.d.ts
declare module 'electron-progressbar' {
  import { BrowserWindowConstructorOptions } from 'electron';

  interface ProgressBarOptions {
    indeterminate?: boolean;
    text?: string;
    detail?: string;
    browserWindow?: BrowserWindowConstructorOptions & { parent?: Electron.BrowserWindow };
    maxValue?: number;
    closable?: boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    title?: string;
    style?: string;
  }

  import { EventEmitter } from 'events';

  class ProgressBar extends EventEmitter {
    constructor(options: ProgressBarOptions);

    value: number;
    detail: string;
    isCompleted(): boolean;
    close(): void;
    setCompleted(): void;
    getOptions(): ProgressBarOptions;
  }

  export = ProgressBar;
}
