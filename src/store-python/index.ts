import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { PythonKernelStoreHandler } from './handler';

export const labStorePythonPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:store_python',
  autoStart: true,
  requires: [ITLabStoreManager],
  activate: (app: JupyterFrontEnd, storeManager: ITLabStoreManager) => {
    storeManager.registerKernelStoreHandler('python', PythonKernelStoreHandler);
  }
};
