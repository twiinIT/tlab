import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';
import { PythonKernelStoreHandler } from './python';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'twiinit_lab:ITLabStoreManager'
);

export interface ITLabStoreManager {
  newStore(): TLabStore;
  getKernelStoreHandler(
    kernel: Kernel.IKernelConnection
  ): Promise<IKernelStoreHandler>;
}

export const labStoreManagerPlugin: JupyterFrontEndPlugin<ITLabStoreManager> = {
  id: 'twiinit_lab:store_manager',
  autoStart: true,
  provides: ITLabStoreManager,
  activate: (app: JupyterFrontEnd) => {
    const store = new TLabStoreManager(app);
    return store;
  }
};

class TLabStoreManager implements ITLabStoreManager {
  private kernelStoreHandlers = new Map<string, IKernelStoreHandler>();

  constructor(private app: JupyterFrontEnd) {}

  newStore() {
    return new TLabStore(this.app, this);
  }

  async getKernelStoreHandler(kernel: Kernel.IKernelConnection) {
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

export class TLabStore {
  sessionContext: SessionContext;
  kernelStoreHandler: IKernelStoreHandler | undefined;

  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabStoreManager
  ) {
    const serviceManager = this.app.serviceManager;
    this.sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: 'twiinIT Lab'
    });
  }

  async connect() {
    // User kernel selection
    const val = await this.sessionContext.initialize();
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }
    // Connect store to the kernel
    this.kernelStoreHandler = await this.manager.getKernelStoreHandler(
      this.kernel
    );
  }

  get kernel() {
    const kernel = this.sessionContext.session?.kernel;
    if (!kernel) {
      throw new Error("Store doesn't have a kernel");
    }
    return kernel;
  }
}

export interface IKernelStoreHandler {}
