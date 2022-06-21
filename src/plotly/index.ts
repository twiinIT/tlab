import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFront } from '../front';

export const labPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:plotly',
  autoStart: true,
  requires: [ITLabFront],
  activate: (app: JupyterFrontEnd, front: ITLabFront) => {
    return;
  }
};
