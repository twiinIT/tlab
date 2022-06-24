// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPyDSManager } from '../store-python/datasource';
import { ITLabStoreManager } from '../store/manager';
import { danfoPythonDS } from './python';
import { danfoModel } from './model';

export const labDanfoPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:danfo',
  autoStart: true,
  requires: [ITLabStoreManager, ITLabPyDSManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    pyDSManager: ITLabPyDSManager
  ) => {
    storeManager.registerModel(danfoModel);
    pyDSManager.register(danfoPythonDS);
  }
};
