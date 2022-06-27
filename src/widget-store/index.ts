// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFrontManager } from '../front/manager';
import { StoreWidget } from './widget';

/**
 * Store controller widget plugin.
 */
export const labWidgetStorePlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:widget_store',
  autoStart: true,
  requires: [ITLabFrontManager],
  activate: (app: JupyterFrontEnd, manager: ITLabFrontManager) => {
    manager.registerWidget({
      id: 'store',
      name: 'Store',
      component: StoreWidget
    });
  }
};
