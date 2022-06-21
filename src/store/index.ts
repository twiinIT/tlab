import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager, TLabStoreManager } from './manager';

export const labStoreManagerPlugin: JupyterFrontEndPlugin<ITLabStoreManager> = {
  id: 'twiinit_lab:store_manager',
  autoStart: true,
  provides: ITLabStoreManager,
  activate: (app: JupyterFrontEnd) => {
    const store = new TLabStoreManager(app);
    return store;
  }
};
