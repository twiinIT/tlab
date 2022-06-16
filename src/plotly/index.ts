import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITwiinITLabFront } from '../front';
import { ITwiinITLabPyArray } from '../pyarray';

export const labPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:plotly',
  requires: [ITwiinITLabFront, ITwiinITLabPyArray],
  activate: (
    app: JupyterFrontEnd,
    front: ITwiinITLabFront,
    pyarray: ITwiinITLabPyArray
  ) => {
    return;
  }
};
