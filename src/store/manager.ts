import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler } from './handler';
import { TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'twiinit_lab:ITLabStoreManager'
);

export interface ITLabStoreManager {
  kernelStoreHandlerFactories: Map<
    string,
    (kernel: Kernel.IKernelConnection) => IKernelStoreHandler
  >;
  newStore(): TLabStore;
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

export class TLabStoreManager implements ITLabStoreManager {
  kernelStoreHandlerFactories = new Map<
    string,
    (kernel: Kernel.IKernelConnection) => IKernelStoreHandler
  >();
  private kernelStoreHandlers = new Map<string, IKernelStoreHandler>();

  constructor(private app: JupyterFrontEnd) {}

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
      const factory = this.kernelStoreHandlerFactories.get(language);
      if (!factory) {
        throw new Error('Language not supported');
      }
      handler = factory(kernel);
      this.kernelStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }
}
