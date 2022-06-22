import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFront } from '../front/front';

export const labWidgetPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'twiinit_lab:widget_plotly',
  autoStart: true,
  requires: [ITLabFront],
  activate: (app: JupyterFrontEnd, front: ITLabFront) => {
    return;
  }
};
