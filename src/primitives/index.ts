// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';

/**
 * Primitives support plugin.
 */
export const labPrimitivesPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:primitives',
  autoStart: true,
  optional: [ITLabStoreManager],
  activate: (app: JupyterFrontEnd, storeManager?: ITLabStoreManager) => {
    return;
  }
};
