import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'twiinit_lab:ITLabStoreManager'
);

type IKernelStoreHandlerCT = {
  new (kernel: Kernel.IKernelConnection): IKernelStoreHandler;
};

export interface ITLabStoreManager {
  registerKernelStoreHandler(
    language: string,
    handlerClass: IKernelStoreHandlerCT
  ): void;
  newStore(): TLabStore;
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

export class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlerFactories: Map<string, IKernelStoreHandlerCT>;
  private kernelStoreHandlers: Map<string, IKernelStoreHandler>;

  constructor(private app: JupyterFrontEnd) {
    this.kernelStoreHandlerFactories = new Map();
    this.kernelStoreHandlers = new Map();
  }

  registerKernelStoreHandler(
    language: string,
    handlerClass: IKernelStoreHandlerCT
  ): void {
    this.kernelStoreHandlerFactories.set(language, handlerClass);
  }

  newStore(): TLabStore {
    return new TLabStore(this.app, this);
  }

  async getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler> {
    let handler = this.kernelStoreHandlers.get(kernel.id);
    if (!handler) {
      const infos = await kernel.info;
      const language = infos.language_info.name;
      const handlerClass = this.kernelStoreHandlerFactories.get(language);
      if (!handlerClass) {
        throw new Error('Language not supported');
      }
      handler = new handlerClass(kernel);
      this.kernelStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }
}
