// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { PythonKernelStoreHandler } from './handler';
import { ITLabPythonManager, TLabPythonManager } from './manager';

/**
 * Python support plugin.
 */
export const labPythonPlugin: JupyterFrontEndPlugin<ITLabPythonManager> = {
  id: 'tlab:python',
  autoStart: true,
  requires: [ITLabStoreManager],
  provides: ITLabPythonManager,
  activate: (app: JupyterFrontEnd, storeManager: ITLabStoreManager) => {
    const manager = new TLabPythonManager();
    storeManager.registerKernelStoreHandler(
      'python',
      (...args) => new PythonKernelStoreHandler(manager, ...args)
    );
    return manager;
  }
};
