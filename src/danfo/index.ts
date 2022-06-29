// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPyDSManager } from '../store-python/datasource';
import { ITLabStoreManager } from '../store/manager';
import { danfoDFModel } from './model';
import { danfoPythonDS } from './python';

/**
 * Danfo.js support plugin.
 */
export const labDanfoPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:danfo',
  autoStart: true,
  optional: [ITLabStoreManager, ITLabPyDSManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager?: ITLabStoreManager,
    pyDSManager?: ITLabPyDSManager
  ) => {
    storeManager?.registerModel(danfoDFModel);
    pyDSManager?.register(danfoPythonDS);
  }
};
