import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFront } from '../front';
import { ITLabStore } from '../store';

export const labPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:plotly',
  autoStart: true,
  requires: [ITLabFront, ITLabStore],
  activate: (app: JupyterFrontEnd, front: ITLabFront, store: ITLabStore) => {
    return;
  }
};
