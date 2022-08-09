// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import * as models from './models';

/**
 * Builtins models plugin.
 */
export const labBuiltinsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:builtins',
  autoStart: true,
  requires: [ITLabStoreManager],
  activate: (app: JupyterFrontEnd, manager: ITLabStoreManager) => {
    // register builtins models
    for (const model of Object.values(models)) manager.registerModel(model);
  }
};
