// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPyDSManager } from '../store-python/datasource';
import { ITLabStoreManager } from '../store/manager';
import { models } from './models';
import { dataSources } from './python';

/**
 * Primitives support plugin.
 */
export const labPrimitivesPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:primitives',
  autoStart: true,
  optional: [ITLabStoreManager, ITLabPyDSManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager?: ITLabStoreManager,
    pyDSManager?: ITLabPyDSManager
  ) => {
    models.forEach(m => storeManager?.registerModel(m));
    dataSources.forEach(ds => pyDSManager?.register(ds));
  }
};
