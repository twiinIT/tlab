import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Token } from '@lumino/coreutils';
import { ITwiinITLabStore } from '../store';

export const ITwiinITLabPyArray = new Token<ITwiinITLabPyArray>(
  'twiinit_lab:ITwiinITLabPyArray'
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITwiinITLabPyArray {}

export const labPyArrayPlugin: JupyterFrontEndPlugin<ITwiinITLabPyArray> = {
  id: 'twiinit_lab:pyarray',
  autoStart: true,
  requires: [ITwiinITLabStore],
  provides: ITwiinITLabPyArray,
  activate: (
    app: JupyterFrontEnd,
    store: ITwiinITLabStore
  ): ITwiinITLabPyArray => {
    return new TwiinITLabPyArray();
  }
};

class TwiinITLabPyArray implements ITwiinITLabPyArray {}
