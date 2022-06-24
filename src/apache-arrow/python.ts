// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IPyDataSource } from '../store-python/datasource';
import { arrowModel } from './model';

export const arrowPythonDS: IPyDataSource = {
  id: 'apache_arrow',
  script: '',
  provides: [arrowModel]
};
