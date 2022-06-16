import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SessionContext, sessionContextDialogs } from '@jupyterlab/apputils';
import { Token } from '@lumino/coreutils';
import { ITwiinITLabFront } from '../front';

export const ITwiinITLabStore = new Token<ITwiinITLabStore>(
  'twiinit_lab:ITwiinITLabStore'
);

export interface ITwiinITLabStore {
  newInstance(id: string): ITwiinITLabStoreInstance;
}

export interface ITwiinITLabStoreInstance {
  connect(): Promise<void>;
  dispose(): Promise<void>;
}

export const labStorePlugin: JupyterFrontEndPlugin<ITwiinITLabStore> = {
  id: 'twiinit_lab:store',
  requires: [ITwiinITLabFront],
  provides: ITwiinITLabStore,
  activate: (
    app: JupyterFrontEnd,
    front: ITwiinITLabFront
  ): ITwiinITLabStore => {
    const store = new TwiinITLabStore(app);
    front.store = store;
    return store;
  }
};

class TwiinITLabStore implements ITwiinITLabStore {
  constructor(private app: JupyterFrontEnd) {}

  newInstance(id: string): TwiinITLabStoreInstance {
    return new TwiinITLabStoreInstance(this.app);
  }
}

class TwiinITLabStoreInstance implements ITwiinITLabStoreInstance {
  private sessionContext?: SessionContext;

  constructor(private app: JupyterFrontEnd) {}

  async connect() {
    const serviceManager = this.app.serviceManager;

    this.sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: 'twiinIT Lab'
    });

    const val = await this.sessionContext.initialize();
    if (val) {
      await sessionContextDialogs.selectKernel(this.sessionContext);
    }
  }

  async dispose() {
    if (this.sessionContext) {
      await this.sessionContext.session?.shutdown();
      this.sessionContext.dispose();
    }
  }
}
