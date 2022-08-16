// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager, TLabStoreManager } from './manager';

/**
 * Store manager plugin.
 */
export const labStoreManagerPlugin: JupyterFrontEndPlugin<ITLabStoreManager> = {
  id: 'tlab:store_manager',
  autoStart: true,
  provides: ITLabStoreManager,
  activate: (app: JupyterFrontEnd) => {
    const storeManager = new TLabStoreManager(app);
    return storeManager;
  }
};
