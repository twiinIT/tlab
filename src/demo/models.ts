// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { ArrayModel } from '../builtins/models';
import { Model, sync } from '../store/models';

export class BallisticsModel extends Model {
  static _modelName = 'Ballistics';
  _modelName = BallisticsModel._modelName;

  // Inputs
  @sync()
  x0 = new ArrayModel();

  // Outputs
  @sync()
  v0 = new ArrayModel();
  @sync()
  time = new ArrayModel();
  @sync()
  x = new ArrayModel();
  @sync()
  z = new ArrayModel();

  constructor() {
    super();
    this.x0.value = [0, 0, 0];
  }

  runDrivers() {
    this.next({ op: 'message', path: [], value: 'run_drivers' });
  }
}
