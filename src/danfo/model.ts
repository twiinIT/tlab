// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { DataFrame } from 'danfojs';
import { IDataModel } from '../store/model';

export const danfoModel: IDataModel<DataFrame> = {
  id: 'danfo',
  name: 'Danfo.js',
  deserialize: async data => new DataFrame(data)
};
