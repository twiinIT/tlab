import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITwiinITLabFront } from '../front';
import { ITwiinITLabStore } from '../store';

export const labPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:plotly',
  autoStart: true,
  requires: [ITwiinITLabFront, ITwiinITLabStore],
  activate: (
    app: JupyterFrontEnd,
    front: ITwiinITLabFront,
    store: ITwiinITLabStore
  ) => {
    return;
  }
};
