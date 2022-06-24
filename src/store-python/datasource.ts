// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { Token } from '@lumino/coreutils';

export const ITLabPyDSManager = new Token<ITLabPyDSManager>(
  'tlab:ITLabPyDSManager'
);

export interface ITLabPyDSManager {
  dataSources: IterableIterator<IPyDataSource>;
  register(ds: IPyDataSource): void;
}

export interface IPyDataSource {
  id: string;
  module: string;
  class: string;
}

export class TLabPyDSManager implements ITLabPyDSManager {
  private _dataSources: Map<string, IPyDataSource>;

  constructor() {
    this._dataSources = new Map();
  }

  get dataSources(): IterableIterator<IPyDataSource> {
    return this._dataSources.values();
  }

  register(ds: IPyDataSource): void {
    this._dataSources.set(ds.id, ds);
  }
}
