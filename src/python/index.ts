// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { connector } from './connector';

/**
 * Python support plugin.
 */
export const labStorePythonPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:store_python',
  autoStart: true,
  requires: [ITLabStoreManager],
  activate: (app: JupyterFrontEnd, storeManager: ITLabStoreManager) => {
    storeManager.registerKernelStoreConnector('python', connector);
  }
};
