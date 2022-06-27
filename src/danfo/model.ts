// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { DataFrame } from 'danfojs';
import { IDataModel } from '../store/model';

/**
 * Danfo.js DataFrame data model.
 */
export const danfoDFModel: IDataModel<DataFrame> = {
  id: 'danfo_df',
  name: 'Danfo.js DataFrame',
  deserialize: obj => {
    const { records, index } = obj;
    return new DataFrame(JSON.parse(records), { index });
  }
};
