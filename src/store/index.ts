import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';

export const ITwiinITLabStore = new Token<ITwiinITLabStore>(
  'twiinit_lab:ITwiinITLabStore'
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITwiinITLabStore {}

export const labStorePlugin: JupyterFrontEndPlugin<ITwiinITLabStore> = {
  id: 'twiinit_lab:store',
  provides: ITwiinITLabStore,
  activate: (app: JupyterFrontEnd): ITwiinITLabStore => {
    const store = new TwiinITLabStore();
    return store;
  }
};

class TwiinITLabStore implements ITwiinITLabStore {}
