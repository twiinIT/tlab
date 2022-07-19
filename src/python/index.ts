// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { PythonKernelStoreHandler } from './handler';

/**
 * Python support plugin.
 */
export const labPythonPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:python',
  autoStart: true,
  requires: [ITLabStoreManager],
  activate: (app: JupyterFrontEnd, storeManager: ITLabStoreManager) => {
    storeManager.registerKernelStoreHandler('python', PythonKernelStoreHandler);
  }
};
