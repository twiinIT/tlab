// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { IDataModel } from '../store/model';

const nullModel: IDataModel<null> = {
  id: 'null',
  name: 'Null',
  deserialize: JSON.parse
};

const booleanModel: IDataModel<boolean> = {
  id: 'boolean',
  name: 'Boolean',
  deserialize: JSON.parse
};

const numberModel: IDataModel<number> = {
  id: 'number',
  name: 'Number',
  deserialize: JSON.parse
};

const stringModel: IDataModel<string> = {
  id: 'string',
  name: 'String',
  deserialize: JSON.parse
};

export const models: IDataModel<any>[] = [
  nullModel,
  booleanModel,
  numberModel,
  stringModel
];
