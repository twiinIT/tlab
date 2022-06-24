// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPyDSManager } from '../store-python/datasource';
import { ITLabStoreManager } from '../store/manager';
import { arrowPythonDS } from './python';
import { arrowModel } from './model';

export const labApacheArrowPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:ds_python_builtins',
  autoStart: true,
  requires: [ITLabStoreManager, ITLabPyDSManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    pyDSManager: ITLabPyDSManager
  ) => {
    storeManager.registerModel(arrowModel);
    pyDSManager.register(arrowPythonDS);
  }
};
