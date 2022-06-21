import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';

export const ITLabStore = new Token<ITLabStore>('twiinit_lab:ITLabStore');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITLabStore {}

export const labStorePlugin: JupyterFrontEndPlugin<ITLabStore> = {
  id: 'twiinit_lab:store',
  provides: ITLabStore,
  activate: (app: JupyterFrontEnd): ITLabStore => {
    const store = new TLabStore();
    return store;
  }
};

class TLabStore implements ITLabStore {}
