// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFrontManager } from '../front/manager';
import { PlotlyWidget } from './widget';

/**
 * Plotly widget plugin.
 */
export const labWidgetPlotlyPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:widget_plotly',
  autoStart: true,
  requires: [ITLabFrontManager],
  activate: (app: JupyterFrontEnd, manager: ITLabFrontManager) => {
    manager.registerWidget({
      id: 'plotly',
      name: 'Plotly',
      component: PlotlyWidget
    });
  }
};
