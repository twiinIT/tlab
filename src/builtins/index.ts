// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabStoreManager } from '../store/manager';
import { ITLabCtrlManager } from '../widget-controller/manager';
import * as controllers from './controllers';
import * as models from './models';

/**
 * Builtins models plugin.
 */
export const labBuiltinsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:builtins',
  autoStart: true,
  requires: [ITLabStoreManager, ITLabCtrlManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    ctrlManager: ITLabCtrlManager
  ) => {
    // register builtins models
    for (const model of Object.values(models)) {
      storeManager.registerModel(model);
    }
    // register controller widgets
    // TODO: something cleaner than this
    ctrlManager.registerController(
      models.BooleanModel._modelName,
      controllers.BoolCheckbox,
      'Checkbox'
    );
    ctrlManager.registerController(
      models.NumberModel._modelName,
      controllers.NumberInput,
      'Input'
    );
    ctrlManager.registerController(
      models.NumberModel._modelName,
      controllers.NumberSlider,
      'Slider'
    );
    ctrlManager.registerController(
      models.StringModel._modelName,
      controllers.StringInput,
      'Input'
    );
    ctrlManager.registerController(
      models.ArrayModel._modelName,
      controllers.ArrayInput,
      'Input'
    );
  }
};
