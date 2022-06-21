import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';

export const ITLabStoreManager = new Token<ITLabStoreManager>(
  'twiinit_lab:ITLabStoreManager'
);

export interface ITLabStoreManager {
  newStore(): TLabStore;
}

export const labStoreManagerPlugin: JupyterFrontEndPlugin<ITLabStoreManager> = {
  id: 'twiinit_lab:store_manager',
  autoStart: true,
  provides: ITLabStoreManager,
  activate: (app: JupyterFrontEnd): ITLabStoreManager => {
    const store = new TLabStoreManager(app);
    return store;
  }
};

class TLabStoreManager implements ITLabStoreManager {
  constructor(private app: JupyterFrontEnd) {}

  newStore(): TLabStore {
    return new TLabStore(this.app, this);
  }
}

export class TLabStore {
  sessionContext: SessionContext;

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

  async connect(): Promise<void> {
    console.log(this);
    const val = await this.sessionContext.initialize();
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }
  }
}
