import { JupyterFrontEnd } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { Token } from '@lumino/coreutils';
import { IKernelStoreHandler, PythonKernelStoreHandler } from './handler';
import { TLabStore } from './store';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'twiinit_lab:ITLabStoreManager'
);

export interface ITLabStoreManager {
  newStore(): TLabStore;
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

export class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlers = new Map<string, IKernelStoreHandler>();

  constructor(private app: JupyterFrontEnd) {}

  newStore(): TLabStore {
    return new TLabStore(this.app, this);
  }

  async getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler> {
    // TODO: language handling
    const infos = await kernel.info;
    const language = infos.language_info.name;
    if (language !== 'python') {
      throw new Error('Language not supported');
    }
    let handler = this.kernelStoreHandlers.get(kernel.id);
    if (!handler) {
      handler = new PythonKernelStoreHandler(kernel);
      this.kernelStoreHandlers.set(kernel.id, handler);
    }
    return handler;
  }
}
