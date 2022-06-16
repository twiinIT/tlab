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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITwiinITLabStore {}

export const labStorePlugin: JupyterFrontEndPlugin<ITwiinITLabStore> = {
  id: 'twiinit_lab:store',
  requires: [ITwiinITLabFront],
  provides: ITwiinITLabStore,
  activate: (
    app: JupyterFrontEnd,
    front: ITwiinITLabFront
  ): ITwiinITLabStore => {
    return new TwiinITLabStore(app);
  }
};

class TwiinITLabStore implements ITwiinITLabStore {
  private sessionContext: SessionContext;

  constructor(private app: JupyterFrontEnd) {
    const serviceManager = this.app.serviceManager;

    this.sessionContext = new SessionContext({
      sessionManager: serviceManager.sessions,
      specsManager: serviceManager.kernelspecs,
      name: 'twiinIT Lab'
    });

    this.sessionContext.initialize().then(async value => {
      if (value) {
        await sessionContextDialogs.selectKernel(this.sessionContext);
      }
    });
  }
}
