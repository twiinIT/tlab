// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFrontManager } from '../front/manager';
import { ITLabCtrlManager, TLabCtrlManager } from './manager';
import { ControllerWidget } from './widget';

/**
 * Controller widget plugin.
 */
export const labWidgetCtrlPlugin: JupyterFrontEndPlugin<ITLabCtrlManager> = {
  id: 'tlab:widget_controller',
  autoStart: true,
  requires: [ITLabFrontManager],
  provides: ITLabCtrlManager,
  activate: (app: JupyterFrontEnd, frontManager: ITLabFrontManager) => {
    const manager = new TLabCtrlManager();
    frontManager.registerWidget({
      id: 'controller',
      name: 'Controller',
      component: props => ControllerWidget({ ...props, ctrlManager: manager })
    });
    return manager;
  }
};
