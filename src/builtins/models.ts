// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import ndarray, { NdArray } from 'ndarray';
import { Model, sync } from '../store/models';

interface IValueModel<T> extends Model {
  value: T;
}

export class BooleanModel extends Model implements IValueModel<boolean> {
  static _modelName = 'Boolean';
  _modelName = BooleanModel._modelName;

  @sync({
    deserialize: v => {
      if (typeof v !== 'boolean') throw new Error('Boolean value expected');
      return v;
    }
  })
  value = false;
}

export class NumberModel extends Model implements IValueModel<number> {
  static _modelName = 'Number';
  _modelName = NumberModel._modelName;

  @sync({
    deserialize: v => {
      if (typeof v !== 'number') throw new Error('Number value expected');
      return v;
    }
  })
  value = 0;
}

export class StringModel extends Model implements IValueModel<string> {
  static _modelName = 'String';
  _modelName = StringModel._modelName;

  @sync({
    deserialize: v => {
      if (typeof v !== 'string') throw new Error('String value expected');
      return v;
    }
  })
  value = '';
}

export class ArrayModel extends Model implements IValueModel<any[]> {
  static _modelName = 'Array';
  _modelName = ArrayModel._modelName;

  @sync({
    deserialize: v => {
      if (!Array.isArray(v)) throw new Error('Array value expected');
      return v;
    }
  })
  value: any[] = [];
}

export class NDArrayModel extends Model implements IValueModel<NdArray> {
  static _modelName = 'NDArray';
  _modelName = NDArrayModel._modelName;

  @sync({
    deserialize: ({ shape, data }) => {
      if (!Array.isArray(data)) throw new Error('Array value expected');
      return ndarray(data, shape);
    },
    serialize: v =>
      v && {
        data: v.data,
        shape: v.shape
      }
  })
  value = ndarray([]);
}
