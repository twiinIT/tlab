// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IPyDataSource } from '../store-python/datasource';
import { danfoModel } from './model';

export const danfoPythonDS: IPyDataSource = {
  id: 'danfo',
  script: '',
  provides: [danfoModel]
};
