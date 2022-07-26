// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager, TLabStoreManager } from './manager';
import { Family, Person } from './tests';

/**
 * Store manager plugin.
 */
export const labStoreManagerPlugin: JupyterFrontEndPlugin<ITLabStoreManager> = {
  id: 'tlab:store_manager',
  autoStart: true,
  provides: ITLabStoreManager,
  activate: (app: JupyterFrontEnd) => {
    const manager = new TLabStoreManager(app);
    manager.registerModel(Person);
    manager.registerModel(Family);
    return manager;
  }
};
