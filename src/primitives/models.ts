// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IDataModel } from '../store/model';

const nullModel: IDataModel = {
  id: 'null',
  name: 'Null',
  deserialize: JSON.parse
};

const booleanModel: IDataModel = {
  id: 'boolean',
  name: 'Boolean',
  deserialize: JSON.parse
};

const numberModel: IDataModel = {
  id: 'number',
  name: 'Number',
  deserialize: JSON.parse
};

const stringModel: IDataModel = {
  id: 'string',
  name: 'String',
  deserialize: JSON.parse
};

const arrayModel: IDataModel = {
  id: 'array',
  name: 'Array',
  deserialize: JSON.parse
};

export const models: IDataModel[] = [
  nullModel,
  booleanModel,
  numberModel,
  stringModel,
  arrayModel
];
