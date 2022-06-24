// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { ITLabPyDSManager, TLabPyDSManager } from './datasource';
import { PythonKernelStoreHandler } from './handler';

export const labStorePythonPlugin: JupyterFrontEndPlugin<ITLabPyDSManager> = {
  id: 'tlab:store_python',
  autoStart: true,
  requires: [ITLabStoreManager],
  provides: ITLabPyDSManager,
  activate: (app: JupyterFrontEnd, storeManager: ITLabStoreManager) => {
    const dsManager = new TLabPyDSManager();
    storeManager.registerKernelStoreHandler(
      'python',
      k => new PythonKernelStoreHandler(k, dsManager)
    );
    return dsManager;
  }
};
