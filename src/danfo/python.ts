// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IPyDataSource } from '../store-python/datasource';

/**
 * Danfo.js Python datasource.
 */
export const danfoPythonDS: IPyDataSource = {
  id: 'danfo',
  module: 'tlab.danfo',
  class: 'DanfoDataSource'
};
