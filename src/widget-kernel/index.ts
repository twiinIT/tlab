// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabFrontManager } from '../front/manager';
import { KernelWidget } from './widget';

/**
 * Kernel controller widget plugin.
 */
export const labWidgetKernelPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:widget_kernel',
  autoStart: true,
  requires: [ITLabFrontManager],
  activate: (app: JupyterFrontEnd, frontManager: ITLabFrontManager) => {
    frontManager.registerWidget({
      id: 'kernel',
      name: 'Kernel',
      component: KernelWidget
    });
  }
};
