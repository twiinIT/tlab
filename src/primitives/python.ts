// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IPyDataSource } from '../store-python/datasource';

const nullPythonDS: IPyDataSource = {
  id: 'primitives_null',
  module: 'tlab.primitives',
  class: 'NullDataSource'
};

const booleanPythonDS: IPyDataSource = {
  id: 'primitives_boolean',
  module: 'tlab.primitives',
  class: 'BooleanDataSource'
};

const numberPythonDS: IPyDataSource = {
  id: 'primitives_number',
  module: 'tlab.primitives',
  class: 'NumberDataSource'
};

const stringPythonDS: IPyDataSource = {
  id: 'primitives_string',
  module: 'tlab.primitives',
  class: 'StringDataSource'
};

export const dataSources: IPyDataSource[] = [
  nullPythonDS,
  booleanPythonDS,
  numberPythonDS,
  stringPythonDS
];
