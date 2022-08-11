// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPythonManager } from '../python/manager';
import { ITLabStoreManager } from '../store/manager';
import { ITLabCtrlManager } from '../widget-controller/manager';
import { CoSAppRunner } from './controllers';
import { BallisticsModel } from './models';

/**
 * Demo plugin.
 */
export const labDemoPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:demo',
  autoStart: true,
  requires: [ITLabStoreManager, ITLabPythonManager, ITLabCtrlManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    pyManager: ITLabPythonManager,
    ctrlManager: ITLabCtrlManager
  ) => {
    storeManager.registerModel(BallisticsModel);
    pyManager.registerClass(
      BallisticsModel._modelName,
      'tlab.demo',
      'BallisticsTLab'
    );
    ctrlManager.registerController(
      BallisticsModel._modelName,
      CoSAppRunner,
      'Runner'
    );
  }
};
