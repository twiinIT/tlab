// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ITLabPythonManager } from '../python/manager';
import { ITLabStoreManager } from '../store/manager';
import { ITLabCtrlManager } from '../widget-controller/manager';
import * as controllers from './controllers';
import * as models from './models';

/**
 * Builtins models plugin.
 * TODO: make registrations cleaner.
 */
export const labBuiltinsPlugin: JupyterFrontEndPlugin<void> = {
  id: 'tlab:builtins',
  autoStart: true,
  requires: [ITLabStoreManager, ITLabCtrlManager, ITLabPythonManager],
  activate: (
    app: JupyterFrontEnd,
    storeManager: ITLabStoreManager,
    ctrlManager: ITLabCtrlManager,
    pyManager: ITLabPythonManager
  ) => {
    // register models in store manager and controller manager
    for (const model of Object.values(models)) {
      storeManager.registerModel(model);
      ctrlManager.registerModel(model);
    }

    // register controller widgets
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

    // register python classes
    pyManager.registerClass(
      models.BooleanModel._modelName,
      'tlab.builtins',
      'BooleanModel'
    );
    pyManager.registerClass(
      models.NumberModel._modelName,
      'tlab.builtins',
      'NumberModel'
    );
    pyManager.registerClass(
      models.StringModel._modelName,
      'tlab.builtins',
      'StringModel'
    );
    pyManager.registerClass(
      models.ArrayModel._modelName,
      'tlab.builtins',
      'ArrayModel'
    );
    pyManager.registerClass(
      models.NDArrayModel._modelName,
      'tlab.builtins',
      'NDArrayModel'
    );
  }
};
